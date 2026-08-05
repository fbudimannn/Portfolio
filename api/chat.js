import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const MAX_MESSAGE_LENGTH = 500;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;
const MODEL_TIMEOUT_MS = 18_000;
const MAX_CONTEXT_CHARS = 14_000;

const WHATSAPP_URL =
  'https://api.whatsapp.com/send/?phone=%2B6282227075226&text&type=phone_number&app_absent=0';

// Sequential priority: Gemma/Gemini first (per ADVANCED RAG flow), then NVIDIA, Llama, Qwen
const MODEL_CANDIDATES = [
  'google/gemma-4-26b-a4b-it:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'qwen/qwen3-coder:free',
  'meta-llama/llama-3.2-3b-instruct:free',
];

const rateLimitStore = new Map();
let cachedSystemPrompt = null;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(ip, { windowStart: now, count: 1 });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) return true;
  entry.count += 1;
  return false;
}

function loadProjectsData() {
  const candidates = [
    path.join(process.cwd(), 'docs', 'projects_data_compiled.md'),
    path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'docs', 'projects_data_compiled.md'),
  ];

  for (const projectsPath of candidates) {
    try {
      const raw = fs.readFileSync(projectsPath, 'utf8');
      if (raw.length <= MAX_CONTEXT_CHARS) return raw;
      return `${raw.slice(0, MAX_CONTEXT_CHARS)}\n\n[Portfolio context truncated for faster responses.]`;
    } catch {
      // try next path
    }
  }

  console.error('Failed to read projects file from known locations.');
  return 'No projects data available.';
}

async function fetchSupabaseKnowledge() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!url || !key || url.includes('your-project')) return null;

  try {
    const res = await fetch(`${url}/rest/v1/portfolio_knowledge?select=title,category,content`, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      }
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    return data.map(item => `### [${item.category.toUpperCase()}] ${item.title}\n${item.content}`).join('\n\n');
  } catch (err) {
    console.warn('Failed to fetch dynamic knowledge from Supabase, falling back to local file:', err.message);
    return null;
  }
}

async function getSystemPrompt() {
  if (cachedSystemPrompt) return cachedSystemPrompt;

  const dynamicKnowledge = await fetchSupabaseKnowledge();
  const projectsData = dynamicKnowledge || loadProjectsData();

  cachedSystemPrompt = `You are Fakhri Budiman's portfolio assistant. Answer ONLY using facts from the portfolio database below. Never invent projects, numbers, or employers.

Core profile:
- Data Analyst & AI Enthusiast, Indonesia
- MSc Business Analytics, University of Warwick
- Skills: SQL, PostgreSQL, BigQuery, Tableau, Power BI, Python, ML, Generative AI

Portfolio database:
${projectsData}

Navigation (only when user wants to open a site section):
- skills/tools -> navigate_to_skills
- education/experience/career/Warwick -> navigate_to_experience
- projects/case studies -> navigate_to_projects
- contact/linkedin/email/whatsapp -> navigate_to_contact

LANGUAGE RULES (critical):
- Reply in the SAME language/style as the user.
- Indonesian question -> Indonesian answer.
- Jaksel request -> casual Jakarta slang (gue/lo/nih/banget/gas/bro), stay factual.
- English question -> English answer.
- If user only asks whether you CAN use a language, confirm IN that language immediately. Example Jaksel: "Oke siap bro! Mau nanya apa nih tentang Fakhri? Gue jelasin pakai bahasa Jaksel ya."
- Never reply in English when the user writes in Indonesian.
- Never explain meta-capabilities — just answer.

JAKSEL FEW-SHOT:
User: "bisa bahasa jaksel?"
Assistant reply: "Oke siap bro! Mau nanya apa nih tentang Fakhri? Gue jelasin pakai bahasa Jaksel ya."
User: "jelasin project ML-nya fakhri"
Assistant reply: "Sip! Salah satu project ML Fakhri itu F1 Bayesian Predictor — dia bikin model prediksi pakai Python buat analisis data F1. Tools-nya Python, fokusnya machine learning & visualisasi hasil. Mau gue bahas project lain juga?"

OUTPUT FORMAT (strict):
Respond ONLY with JSON: {"reply":"plain text string","action":null|"navigate_to_skills"|"navigate_to_experience"|"navigate_to_projects"|"navigate_to_contact"}
- "reply" MUST be a single string. No nested objects. No field names like project_overview or Profile Summary as labels.
- Use markdown bullets and [Label](url) for links when needed.
- Keep answers concise unless user asks for a specific length.`;

  return cachedSystemPrompt;
}

function detectLanguageMode(message) {
  const lower = message.toLowerCase();

  if (
    /jaksel|jakselo|bahasa\s*gaul|bahasa\s*jakarta|gue\s*lo|sok\s*gaul/i.test(lower) ||
    /\bbro+k?\b|\bbjir\b|\bgas+kan\b/i.test(lower)
  ) {
    return 'jaksel';
  }

  if (
    /bahasa\s*indo(?:nesia)?|dalam\s*bahasa\s*indo|pakai\s*indo|jelaskan\s*dalam|gunakan\s*bahasa\s*indo/i.test(
      lower
    )
  ) {
    return 'id';
  }

  const idHints =
    /\b(hai|halo|dong|gimana|kenapa|jelasin|jelaskan|bisa|tolong|contoh|projectnya|tentang|pakai|bahasa|kau|kamu|gue|gw|ga|gak|nggak|nih|banget|bro|brok|kah|ya|yg|aja|nih)\b/gi;
  const enHints =
    /\b(the|and|what|how|why|tell|about|please|could|would|your|projects|skills|experience|hiring|worth)\b/gi;

  const idCount = (message.match(idHints) || []).length;
  const enCount = (message.match(enHints) || []).length;

  if (idCount >= 2 && idCount >= enCount) return 'id';
  if (enCount >= 2 && enCount > idCount) return 'en';

  // Default: Indonesian if message has typical ID particles
  if (/[áéíóú]|ng$|kah$|dong$|nih\b|gak\b|nggak\b/i.test(lower) || idCount >= 1) {
    return 'id';
  }

  return 'en';
}

function isContactQuestion(message) {
  return /contact|reach\s*(him|fakhri|out)?|email|whatsapp|linkedin|phone|hubungi|kontak|cara\s*hubung|how\s*can\s*i\s*(reach|contact)/i.test(
    message
  );
}

function getContactTemplate(lang) {
  const links = `- [Email](mailto:fakhribudiman1721@gmail.com)
- [WhatsApp](${WHATSAPP_URL})
- [LinkedIn](https://www.linkedin.com/in/muhammad-fakhri-musyaffa-budiman)
- [Portfolio](https://fakhri-budiman-portfolio.vercel.app)
- [GitHub](https://github.com/fbudimannn)`;

  if (lang === 'jaksel') {
    return {
      reply: `Nih bro cara hubungin Fakhri:\n${links}\n\nFeel free buat reach out kalau mau diskusi kolaborasi, job, atau sekadar say hi!`,
      action: 'navigate_to_contact',
    };
  }

  if (lang === 'id') {
    return {
      reply: `Berikut cara menghubungi Fakhri:\n${links}\n\nSilakan hubungi lewat channel mana pun yang paling nyaman untuk Anda.`,
      action: 'navigate_to_contact',
    };
  }

  return {
    reply: `Here's how you can reach Fakhri:\n${links}\n\nFeel free to reach out for collaborations, opportunities, or just to say hello!`,
    action: 'navigate_to_contact',
  };
}

function buildAugmentedUserMessage(message, lang, isRetry = false) {
  const instructions = {
    en: 'Reply in English.',
    id: 'WAJIB jawab dalam Bahasa Indonesia yang natural. Jangan pakai Bahasa Inggris.',
    jaksel:
      'WAJIB jawab pakai bahasa Jaksel gaul Jakarta (gue/lo/nih/banget/gas/bro). Jangan formal, jangan Bahasa Inggris.',
  };

  let prefix = `[Language instruction: ${instructions[lang]}]\n`;
  if (isRetry) {
    prefix += `[RETRY: Your previous answer used the wrong language or invalid format. Fix it now.]\n`;
  }

  return `${prefix}${message}`;
}

function formatReplyValue(value) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        const line = formatReplyValue(item).trim();
        return line ? `- ${line}` : '';
      })
      .filter(Boolean)
      .join('\n');
  }

  if (typeof value === 'object') {
    const preferred = value.highlight || value.text || value.description || value.summary || value.title;
    if (preferred) return formatReplyValue(preferred);
    return Object.entries(value)
      .map(([key, val]) => {
        const text = formatReplyValue(val).trim();
        if (!text) return '';
        const label = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        return `${label}: ${text}`;
      })
      .filter(Boolean)
      .join('\n');
  }

  return String(value);
}

function normalizeReplyField(reply) {
  if (typeof reply === 'string') return reply.trim();
  return formatReplyValue(reply).trim();
}

const VALID_ACTIONS = new Set([
  'navigate_to_skills',
  'navigate_to_experience',
  'navigate_to_projects',
  'navigate_to_contact',
]);

function sanitizeAction(action, reply) {
  if (!action || VALID_ACTIONS.has(action)) {
    return { action: action || null, reply };
  }
  if (typeof action === 'string') {
    return { action: null, reply: `${reply}\n\n${action}`.trim() };
  }
  return { action: null, reply };
}

function looksLikeSchemaDump(reply) {
  return /^(project_overview|profile summary|key projects|core skills|contact info|career goals):/im.test(
    reply
  );
}

function isWrongLanguage(reply, lang) {
  if (lang === 'en') return false;

  const lower = reply.toLowerCase();
  const englishOpeners =
    /^(sure!|sure,|i can|i'll|let me|here's|here is|of course|certainly|absolutely|i am|i'm)/i;
  if (englishOpeners.test(reply.trim())) return true;

  const englishHeavy =
    /\b(the|and|your|projects|skills|experience|summary|overview|would|could|please|let me know)\b/gi;
  const indoHints =
    /\b(yang|dan|dengan|untuk|dari|ini|itu|gue|lo|nih|banget|bro|project|proyek|jelasin|fakhri|data|analisis|skill|pengalaman|bisa|siap|sip|gas)\b/gi;

  const enCount = (reply.match(englishHeavy) || []).length;
  const idCount = (reply.match(indoHints) || []).length;

  if (lang === 'jaksel') {
    const jakselHints = /\b(gue|lo|nih|banget|bro|gas|sip|oke|gw|dong|aja|bjir)\b/i;
    if (!jakselHints.test(lower) && enCount > idCount) return true;
  }

  return enCount >= 4 && enCount > idCount + 1;
}

function unwrapNestedJsonReply(reply) {
  let text = reply.trim();
  if (!text.startsWith('{') && !text.startsWith('[')) return text;

  try {
    const nested = JSON.parse(text);
    if (nested && typeof nested.reply === 'string') {
      return unwrapNestedJsonReply(nested.reply);
    }
  } catch {
    // not nested JSON
  }

  return text;
}

function parseModelResponse(replyText) {
  try {
    const parsedResult = JSON.parse(replyText);

    if (parsedResult && typeof parsedResult === 'object') {
      if (!parsedResult.reply) {
        if (parsedResult.response) parsedResult.reply = parsedResult.response;
        else if (parsedResult.content) parsedResult.reply = parsedResult.content;
        else if (parsedResult.text) parsedResult.reply = parsedResult.text;
        else if (parsedResult.message) parsedResult.reply = parsedResult.message;
        else {
          let formattedText = '';
          for (const [key, val] of Object.entries(parsedResult)) {
            if (key === 'action') continue;
            const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
            const body = formatReplyValue(val).trim();
            if (!body) continue;
            formattedText += `**${formattedKey}**:\n${body}\n\n`;
          }
          parsedResult.reply = formattedText.trim() || 'Here is the information I retrieved.';
        }
      }

      parsedResult.reply = unwrapNestedJsonReply(normalizeReplyField(parsedResult.reply));
      const sanitized = sanitizeAction(parsedResult.action, parsedResult.reply);
      parsedResult.reply = sanitized.reply;
      parsedResult.action = sanitized.action;

      if (!Object.prototype.hasOwnProperty.call(parsedResult, 'action')) {
        parsedResult.action = null;
      }

      return parsedResult;
    }
  } catch {
    // fall through
  }

  return {
    reply: replyText || "I'm sorry, I couldn't formulate a proper response.",
    action: null,
  };
}

function isValidReply(parsed, lang) {
  if (!parsed.reply || parsed.reply.length < 8) return false;
  if (parsed.reply.trim().startsWith('{') || parsed.reply.trim().startsWith('[')) return false;
  if (looksLikeSchemaDump(parsed.reply)) return false;
  if (isWrongLanguage(parsed.reply, lang)) return false;
  return true;
}

async function callOpenRouterModel(modelName, apiKey, systemPrompt, userMessage) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), MODEL_TIMEOUT_MS);

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/fbudimannn/Portfolio',
        'X-Title': 'Fakhri Portfolio Chatbot',
      },
      body: JSON.stringify({
        model: modelName,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.25,
        max_tokens: 850,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Status ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const replyText = data.choices?.[0]?.message?.content;
    if (!replyText) throw new Error('Empty model response');

    return { modelName, replyText };
  } finally {
    clearTimeout(timeoutId);
  }
}

async function getSequentialModelReply(apiKey, systemPrompt, userMessage) {
  let lastError = null;

  for (let i = 0; i < MODEL_CANDIDATES.length; i += 1) {
    const modelName = MODEL_CANDIDATES[i];
    if (i > 0) await sleep(700);

    try {
      const result = await callOpenRouterModel(modelName, apiKey, systemPrompt, userMessage);
      console.log(`Chat success with model: ${modelName}`);
      return result;
    } catch (err) {
      lastError = err;
      console.warn(`Model ${modelName} failed:`, err.message);
    }
  }

  throw lastError || new Error('All model attempts failed');
}

async function generateChatReply(apiKey, userMessage) {
  const lang = detectLanguageMode(userMessage);

  if (isContactQuestion(userMessage)) {
    return getContactTemplate(lang);
  }

  const systemPrompt = await getSystemPrompt();
  const augmented = buildAugmentedUserMessage(userMessage, lang, false);

  const { replyText } = await getSequentialModelReply(apiKey, systemPrompt, augmented);
  let parsed = parseModelResponse(replyText);

  if (!isValidReply(parsed, lang)) {
    console.warn('Reply failed validation, retrying with Gemma only');
    const retryMessage = buildAugmentedUserMessage(userMessage, lang, true);
    try {
      const { replyText: retryText } = await callOpenRouterModel(
        'google/gemma-4-26b-a4b-it:free',
        apiKey,
        systemPrompt,
        retryMessage
      );
      const retryParsed = parseModelResponse(retryText);
      if (isValidReply(retryParsed, lang)) {
        parsed = retryParsed;
      }
    } catch (err) {
      console.warn('Language retry failed:', err.message);
    }
  }

  return parsed;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const rawMessage = req.body?.message;
  if (typeof rawMessage !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  const userMessage = rawMessage.trim();
  if (!userMessage) {
    return res.status(400).json({ error: 'Message cannot be empty' });
  }

  if (userMessage.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({
      error: `Message is too long. Maximum ${MAX_MESSAGE_LENGTH} characters.`,
    });
  }

  const clientIp = getClientIp(req);
  if (isRateLimited(clientIp)) {
    return res.status(429).json({
      error: 'Too many requests. Please wait a moment and try again.',
    });
  }

  const apiKey = (process.env.OPEN_ROUTER_KEY || '').trim();
  if (!apiKey) {
    return res.status(500).json({ error: 'OpenRouter API key is not configured on the server.' });
  }

  try {
    const result = await generateChatReply(apiKey, userMessage);
    return res.status(200).json(result);
  } catch (err) {
    console.error('All chat model attempts failed:', err);
    return res.status(502).json({
      error: 'AI is taking too long right now. Please try again in a few seconds.',
    });
  }
}

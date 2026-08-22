import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const MAX_MESSAGE_LENGTH = 500;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;
const MODEL_TIMEOUT_MS = 15_000;
const MAX_CONTEXT_CHARS = 14_000;

const WHATSAPP_URL =
  'https://api.whatsapp.com/send/?phone=%2B6282227075226&text&type=phone_number&app_absent=0';

// Direct Google AI Studio candidates (Gemini + Gemma versions matching ClinIQ RAG)
const DIRECT_GOOGLE_MODELS = [
  'gemini-3.6-flash',
  'gemma-4-31b-it',
  'gemma-4-26b-a4b-it',
];

// Only proven free models — fewer models = faster total fallback
const OPENROUTER_MODELS = [
  'openrouter/free',
  'meta-llama/llama-3.3-70b-instruct:free',
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

const FALLBACK_SUPABASE_URL = 'https://pgbwebhatdhhdjafmcon.supabase.co';
const FALLBACK_SUPABASE_KEY = 'sb_publishable_8iUwmbwV3YK4ezGi5TXz5g_ctwc3wIA';

function getSupabaseCredentials() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || FALLBACK_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || FALLBACK_SUPABASE_KEY;
  return { url, key };
}

async function fetchSupabaseKnowledge() {
  const { url, key } = getSupabaseCredentials();

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

async function saveChatLogToSupabase({ sessionId, userMessage, botResponse, modelName, latencyMs, ragSource, action }) {
  const { url, key } = getSupabaseCredentials();

  if (!url || !key || url.includes('your-project') || !userMessage) return;

  try {
    const payload = {
      session_id: sessionId || 'anonymous',
      user_message: String(userMessage),
      bot_response: String(botResponse || ''),
      model_name: modelName || 'gemma-4',
      latency_ms: typeof latencyMs === 'number' ? latencyMs : 0,
      rag_source: ragSource || 'pgvector',
      action: action || null
    };

    const res = await fetch(`${url}/rest/v1/chat_logs`, {
      method: 'POST',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`Supabase chat_log insert returned status ${res.status}:`, errText);
    }
  } catch (err) {
    console.warn('Failed to save chat log to Supabase:', err.message);
  }
}

let cachedIsDynamic = false;

async function getSystemPromptWithSource() {
  if (cachedSystemPrompt) return { systemPrompt: cachedSystemPrompt, isDynamic: cachedIsDynamic };

  const dynamicKnowledge = await fetchSupabaseKnowledge();
  cachedIsDynamic = Boolean(dynamicKnowledge);
  const projectsData = dynamicKnowledge || loadProjectsData();

  cachedSystemPrompt = `You are Fakhri Budiman's portfolio assistant. Answer ONLY using facts from the portfolio database below. Never invent projects, numbers, or employers.

Core profile:
- Data Analyst & AI Enthusiast, Indonesia
- MSc Business Analytics, University of Warwick
- Skills: SQL, PostgreSQL, BigQuery, Tableau, Power BI, Python, ML, Generative AI

Portfolio database:
${projectsData}

Navigation — emit the action when user asks WHERE to see something or asks to be directed:
- "lihat skills", "skill kamu apa", "tools" → navigate_to_skills
- "lihat education", "pendidikan", "warwick", "riwayat akademik" → navigate_to_education
- "lihat experience", "pengalaman kerja", "karir", "professional logs", "project archives" → navigate_to_experience
- "lihat project", "project kamu", "case study" → navigate_to_projects
- "kontak", "contact", "hubungi", "email", "whatsapp", "linkedin" → navigate_to_contact

When navigate_to_contact fires, ALWAYS include these links in the reply:
- [Email](mailto:fakhribudiman1721@gmail.com)
- [WhatsApp](https://api.whatsapp.com/send/?phone=%2B6282227075226)
- [LinkedIn](https://www.linkedin.com/in/muhammad-fakhri-musyaffa-budiman)
- [GitHub](https://github.com/fbudimannn)

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
Respond ONLY with JSON: {"reply":"plain text string","action":null|"navigate_to_skills"|"navigate_to_education"|"navigate_to_experience"|"navigate_to_projects"|"navigate_to_contact"}
- "reply" MUST be a single string. No nested objects. No field names like project_overview or Profile Summary as labels.
- Use markdown bullets and [Label](url) for links when needed.
- Keep answers concise unless user asks for a specific length.`;

  return { systemPrompt: cachedSystemPrompt, isDynamic: cachedIsDynamic };
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
  'navigate_to_education',
  'navigate_to_experience',
  'navigate_to_projects',
  'navigate_to_contact',
]);

// Section-question detector: fires BEFORE LLM to instantly direct users
const SECTION_PATTERNS = [
  { pattern: /kontak|contact|hubungi|reach|email|whatsapp|linkedin|phone|nomor/i, action: 'navigate_to_contact' },
  { pattern: /skill|tools?|kemampuan|keahlian|tech stack|teknologi yang dipakai/i, action: 'navigate_to_skills' },
  { pattern: /pendidikan|education|kuliah|warwick|telkom|solbridge|akademik|academic/i, action: 'navigate_to_education' },
  { pattern: /pengalaman kerja|karir|career|professional logs?|kerja di mana|bekerja di|riwayat kerja/i, action: 'navigate_to_experience' },
  { pattern: /project archives?|project kerja|proyek|project lain/i, action: 'navigate_to_experience' },
  { pattern: /project|case stud|portfolio|karya/i, action: 'navigate_to_projects' },
];

const SECTION_LABELS = {
  navigate_to_contact: { id: 'halaman Kontak', en: 'the Contact section' },
  navigate_to_skills: { id: 'halaman Skills', en: 'the Skills section' },
  navigate_to_education: { id: 'portal Education (Academic Archives)', en: 'the Education portal (Academic Archives)' },
  navigate_to_experience: { id: 'portal Experience (Professional Logs & Project Archives)', en: 'the Experience portal' },
  navigate_to_projects: { id: 'halaman Projects', en: 'the Projects section' },
};

const CONTACT_LINKS = `- [Email](mailto:fakhribudiman1721@gmail.com)
- [WhatsApp](https://api.whatsapp.com/send/?phone=%2B6282227075226&text&type=phone_number&app_absent=0)
- [LinkedIn](https://www.linkedin.com/in/muhammad-fakhri-musyaffa-budiman)
- [GitHub](https://github.com/fbudimannn)`;

function detectSectionIntent(message) {
  // Only fires when user is clearly asking WHERE to view something
  const wherePattern = /\b(lihat|bisa lihat|di mana|dimana|ada di|tunjukk?an?|bawa|show|where|take me|go to|open|navigate|scroll|page|section|halaman|portal|bagian)\b/i;
  if (!wherePattern.test(message)) return null;
  for (const { pattern, action } of SECTION_PATTERNS) {
    if (pattern.test(message)) return action;
  }
  return null;
}

function getSectionResponse(action, lang) {
  const label = SECTION_LABELS[action];
  const sectionName = lang === 'en' ? label.en : label.id;

  if (action === 'navigate_to_contact') {
    if (lang === 'jaksel') return { reply: `Nih bro cara hubungin Fakhri:\n${CONTACT_LINKS}\n\nFeel free reach out ya!`, action };
    if (lang === 'id') return { reply: `Yuk, aku arahkan ke ${sectionName}! Berikut kontak Fakhri:\n${CONTACT_LINKS}`, action };
    return { reply: `Here are Fakhri's contact details:\n${CONTACT_LINKS}`, action };
  }

  if (lang === 'jaksel') return { reply: `Gue arahin ke ${sectionName} ya bro! Scroll ke sana sekarang.`, action };
  if (lang === 'id') return { reply: `Oke, aku arahin kamu ke ${sectionName}!`, action };
  return { reply: `Sure! Taking you to ${sectionName} now.`, action };
}

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
  if (!reply) return '';
  let text = String(reply).trim();
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  }
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
  if (!replyText) {
    return { reply: "I'm sorry, I couldn't formulate a proper response.", action: null };
  }

  let cleanText = String(replyText).trim();
  if (cleanText.startsWith('```')) {
    cleanText = cleanText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  }

  try {
    const parsedResult = JSON.parse(cleanText);

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
    const match = cleanText.match(/"reply"\s*:\s*"([\s\S]*)/i) || cleanText.match(/"response"\s*:\s*"([\s\S]*)/i) || cleanText.match(/"content"\s*:\s*"([\s\S]*)/i);
    if (match && match[1]) {
      let raw = match[1].replace(/"\s*\}?\s*$/, '');
      const extracted = raw.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\t/g, '\t');
      return { reply: extracted, action: null };
    }
  }

  return {
    reply: unwrapNestedJsonReply(cleanText),
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
        max_tokens: 1500,
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

async function callDirectGeminiModel(modelName, systemPrompt, userMessage) {
  const geminiApiKey = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '').trim();
  if (!geminiApiKey || geminiApiKey.startsWith('sk-or-') || geminiApiKey.length < 10) {
    throw new Error('No valid Google AI Studio GEMINI_API_KEY configured');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), MODEL_TIMEOUT_MS);

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiApiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\n[USER QUESTION]\n${userMessage}` }] }
        ],
        generationConfig: {
          temperature: 0.25,
          maxOutputTokens: 1500,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Google Gemini Status ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!replyText) throw new Error('Empty Gemini model response');

    return { modelName: `google/${modelName} (Direct AI Studio)`, replyText };
  } finally {
    clearTimeout(timeoutId);
  }
}

async function getSequentialModelReply(apiKey, systemPrompt, userMessage) {
  let lastError = null;
  const startTime = Date.now();
  const TOTAL_BUDGET_MS = 50_000; // bail before Vercel's 60s maxDuration

  // 1. Direct Google AI Studio candidates
  for (const modelName of DIRECT_GOOGLE_MODELS) {
    if (Date.now() - startTime > TOTAL_BUDGET_MS) break;
    try {
      console.log(`[LLM] Trying direct Google model: ${modelName}`);
      const result = await callDirectGeminiModel(modelName, systemPrompt, userMessage);
      console.log(`[LLM] Success with direct Google model: ${result.modelName}`);
      return result;
    } catch (err) {
      lastError = err;
      console.warn(`[LLM] Direct Google model ${modelName} failed:`, err.message);
    }
  }

  // 2. OpenRouter Candidates Fallback
  for (const modelName of OPENROUTER_MODELS) {
    if (Date.now() - startTime > TOTAL_BUDGET_MS) break;
    try {
      console.log(`[LLM] Trying OpenRouter model: ${modelName}`);
      const result = await callOpenRouterModel(modelName, apiKey, systemPrompt, userMessage);
      console.log(`[LLM] Success with OpenRouter model: ${modelName}`);
      return result;
    } catch (err) {
      lastError = err;
      console.warn(`[LLM] OpenRouter model ${modelName} failed:`, err.message);
    }
  }

  throw lastError || new Error('All candidate LLM providers failed');
}

function detectLanguageMode(message) {
  const lower = String(message || '').toLowerCase();
  if (
    /jaksel|bahasa\s*gaul|bahasa\s*jakarta|gue\s*lo/i.test(lower) ||
    /\b(gue|lo|bjir|anjay|brok)\b/i.test(lower)
  ) {
    return 'jaksel';
  }
  const idHints = /\b(hai|halo|dong|gimana|kenapa|jelasin|jelaskan|bisa|tolong|contoh|projectnya|tentang|pakai|bahasa|kau|kamu|gue|gw|ga|gak|nggak|nih|banget|bro|brok|kah|ya|yg|aja|menurutmu|menurut|aku|kira|kirakira|khususnya|apakah|bagus|layak|projek|rekrut|worth|hire)\b/gi;
  const enHints = /\b(the|and|what|how|why|tell|please|could|would|your|projects|skills|experience)\b/gi;
  const idCount = (message.match(idHints) || []).length;
  const enCount = (message.match(enHints) || []).length;
  if (idCount >= 1 && idCount >= enCount) return 'id';
  if (enCount >= 2 && enCount > idCount + 1) return 'en';
  if (/[áéíóú]|ng$|kah$|dong$|nih\b|gak\b|nggak\b|aku\b|menurut\b|bisa\b/i.test(lower) || idCount >= 1) {
    return 'id';
  }
  return 'id';
}

function isOutOfScopeQuestion(message) {
  const lower = String(message || '').toLowerCase().trim();
  const outOfScopePatterns = [
    /\b(resep|masak|rendang|nasi\s*goreng|bikin\s*kue|kuah)\b/i,
    /\b(presiden|pemilu|politik|dpr|parlemen)\b/i,
    /\b(cuaca|hujan|panas|ramalan\s*zodiak|horoskop)\b/i,
    /\b(lirik\s*lagu|chord\s*gitar|main\s*game)\b/i
  ];
  return outOfScopePatterns.some(pattern => pattern.test(lower));
}

function getOutOfScopeResponse(lang) {
  if (lang === 'jaksel' || lang === 'id') {
    return {
      reply: "Sebagai AI Assistant khusus Portofolio Fakhri Budiman, fokus utama saya adalah menjawab seputar **pengalaman, projek Data & AI (seperti ClinIQ RAG), skill teknis, latar belakang pendidikan di University of Warwick, serta kontak Fakhri**.\n\nAda projek atau skill Fakhri tertentu yang ingin kamu tanyakan? 🚀",
      action: null
    };
  }
  return {
    reply: "As Fakhri Budiman's Portfolio AI Assistant, I am specialized in answering questions about **Fakhri's background, Data & AI projects (such as ClinIQ RAG), technical skills, Warwick MSc degree, and contact information**.\n\nFeel free to ask me anything about Fakhri's projects or skills! 🚀",
    action: null
  };
}

async function generateChatReply(apiKey, userMessage) {
  const lang = detectLanguageMode(userMessage);

  if (isOutOfScopeQuestion(userMessage)) {
    const res = getOutOfScopeResponse(lang);
    return { ...res, modelName: 'rule-based-fastpath', ragSource: 'system_out_of_scope' };
  }

  // Fast-path: instantly navigate if user is asking WHERE to view a section
  const sectionAction = detectSectionIntent(userMessage);
  if (sectionAction) {
    const res = getSectionResponse(sectionAction, lang);
    return { ...res, modelName: 'rule-based-fastpath', ragSource: 'system_navigation' };
  }

  const { systemPrompt, isDynamic } = await getSystemPromptWithSource();
  const augmented = buildAugmentedUserMessage(userMessage, lang, false);

  try {
    const { modelName, replyText } = await getSequentialModelReply(apiKey, systemPrompt, augmented);
    let parsed = parseModelResponse(replyText);

    if (!isValidReply(parsed, lang)) {
      console.warn('Reply failed validation, retrying formatting');
      parsed = parseModelResponse(replyText);
    }

    return {
      ...parsed,
      modelName: modelName || 'google/gemini-3.6-flash',
      ragSource: isDynamic ? 'pgvector' : 'local_file'
    };
  } catch (err) {
    console.error('All model attempts failed in generateChatReply:', err.message);
    return {
      reply: lang === 'id' || lang === 'jaksel'
        ? "Fakhri Budiman adalah Data Analyst & AI Specialist (MSc Business Analytics, University of Warwick). Projek utamanya meliputi ClinIQ (Medical RAG Platform indexing 300K+ PubMed abstracts), F1 Bayesian Predictor, dan RFM Customer Segmentation."
        : "Fakhri Budiman is a Data Analyst & AI Specialist (MSc Business Analytics, University of Warwick). Key projects include ClinIQ (34-domain Medical RAG Assistant), F1 Bayesian Predictor, and RFM Segmentation.",
      action: 'navigate_to_projects',
      modelName: 'fallback-portfolio-fastpath',
      ragSource: 'local_file'
    };
  }
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

  const openRouterKey = (process.env.OPEN_ROUTER_KEY || process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY || '').trim();
  const geminiKey = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '').trim();
  const apiKey = openRouterKey || geminiKey || 'dummy_key';

  const startTime = Date.now();
  const sessionId = req.body?.sessionId || 'anonymous';

  try {
    const result = await generateChatReply(apiKey, userMessage);
    const latencyMs = Date.now() - startTime;

    if (result && result.reply) {
      await saveChatLogToSupabase({
        sessionId,
        userMessage,
        botResponse: result.reply,
        modelName: result.modelName,
        latencyMs,
        ragSource: result.ragSource,
        action: result.action
      });
    }
    return res.status(200).json(result);
  } catch (err) {
    console.error('All chat model attempts failed:', err);
    const lang = detectLanguageMode(userMessage);
    return res.status(200).json({
      reply: lang === 'id' || lang === 'jaksel'
        ? "Fakhri Budiman adalah Data Analyst & AI Specialist (MSc Business Analytics, University of Warwick). Projek utamanya meliputi ClinIQ (Medical RAG Platform indexing 300K+ PubMed abstracts), F1 Bayesian Predictor, dan RFM Customer Segmentation."
        : "Fakhri Budiman is a Data Analyst & AI Specialist (MSc Business Analytics, University of Warwick). Key projects include ClinIQ (34-domain Medical RAG Assistant), F1 Bayesian Predictor, and RFM Segmentation.",
      action: 'navigate_to_projects',
      modelName: 'fallback-portfolio-fastpath',
      ragSource: 'local_file'
    });
  }
}

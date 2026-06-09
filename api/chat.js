import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const MAX_MESSAGE_LENGTH = 500;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;
const MODEL_TIMEOUT_MS = 14_000;
const MAX_CONTEXT_CHARS = 16_000;

const rateLimitStore = new Map();
let cachedSystemPrompt = null;

// Race models in parallel — prioritize stronger free models for quality
const MODEL_CANDIDATES = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemma-4-26b-a4b-it:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
  'qwen/qwen3-coder:free',
  'meta-llama/llama-3.2-3b-instruct:free',
  'liquid/lfm-2.5-1.2b-instruct:free',
];

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

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

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
      // Try next candidate path
    }
  }

  console.error('Failed to read projects file from known locations.');
  return 'No projects data available.';
}

function getSystemPrompt() {
  if (cachedSystemPrompt) return cachedSystemPrompt;

  const projectsData = loadProjectsData();

  cachedSystemPrompt = `You are a friendly portfolio guide for Fakhri Budiman. Answer questions about his projects, experience, skills, and background in a warm, natural, and concise manner.

Core profile:
- Role: Data Analyst & AI Enthusiast based in Indonesia.
- Education: MSc Business Analytics at University of Warwick (UK).
- Key Skills: SQL, PostgreSQL, BigQuery, Tableau, Power BI, Python, Machine Learning, Generative AI, Data Visualization.

Portfolio database:
${projectsData}

Navigation actions (only when user wants to see a site section):
- skills/tools -> "navigate_to_skills"
- education/experience/career -> "navigate_to_experience"
- projects/case studies -> "navigate_to_projects"
- contact/linkedin/email -> "navigate_to_contact"
- otherwise -> null

Contact links (use markdown exactly when asked about contact):
- [Email](mailto:fakhribudiman1721@gmail.com)
- [WhatsApp](https://api.whatsapp.com/send/?phone=%2B6282227075226&text&type=phone_number&app_absent=0)
- [LinkedIn](https://www.linkedin.com/in/muhammad-fakhri-musyaffa-budiman)
- [Portfolio](https://fakhri-budiman-portfolio.vercel.app)
- [GitHub](https://github.com/fbudimannn)

Language:
- Match the user's language. Indonesian question -> Indonesian answer.
- If user asks for Jaksel slang / bahasa gaul, reply in casual Jakarta slang (gue/lo, nih, banget, gas) while staying accurate about Fakhri.
- If user only asks whether you CAN use a language/style, confirm IN that style first. Example: "Oke siap! Mau nanya apa nih tentang Fakhri? Gue jelasin pakai bahasa Jaksel ya."

Rules:
- Respond ONLY with valid JSON: {"reply":"...","action":null|"navigate_to_skills"|"navigate_to_experience"|"navigate_to_projects"|"navigate_to_contact"}
- The "reply" value MUST be one plain-text string (markdown bullets ok). NEVER put objects or arrays inside "reply".
- For hiring pitches, write a compelling but factual summary in clear prose or markdown bullets as text.
- Keep answers concise unless the user asks for a specific length.
- Use markdown hyperlinks for contact links, never raw URLs alone.
- Do not hyperlink random phrases in intro sentences.`;

  return cachedSystemPrompt;
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
  if (typeof reply === 'string') return reply;
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
    return {
      action: null,
      reply: `${reply}\n\n${action}`.trim(),
    };
  }

  return { action: null, reply };
}

function parseModelResponse(replyText) {
  try {
    const parsedResult = JSON.parse(replyText);

    if (parsedResult && typeof parsedResult === 'object') {
      if (!parsedResult.reply) {
        if (parsedResult.response) {
          parsedResult.reply = parsedResult.response;
        } else if (parsedResult.content) {
          parsedResult.reply = parsedResult.content;
        } else if (parsedResult.text) {
          parsedResult.reply = parsedResult.text;
        } else if (parsedResult.message) {
          parsedResult.reply = parsedResult.message;
        } else {
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

      parsedResult.reply = normalizeReplyField(parsedResult.reply);
      const sanitized = sanitizeAction(parsedResult.action, parsedResult.reply);
      parsedResult.reply = sanitized.reply;
      parsedResult.action = sanitized.action;

      if (!Object.prototype.hasOwnProperty.call(parsedResult, 'action')) {
        parsedResult.action = null;
      }

      return parsedResult;
    }
  } catch {
    // Fall through to plain-text fallback
  }

  return {
    reply: replyText || "I'm sorry, I couldn't formulate a proper response.",
    action: null,
  };
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
        temperature: 0.2,
        max_tokens: 900,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Status ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const replyText = data.choices?.[0]?.message?.content;
    if (!replyText) {
      throw new Error('Empty model response');
    }

    return { modelName, replyText };
  } finally {
    clearTimeout(timeoutId);
  }
}

async function getFastestModelReply(apiKey, systemPrompt, userMessage) {
  const attempts = MODEL_CANDIDATES.map((modelName) =>
    callOpenRouterModel(modelName, apiKey, systemPrompt, userMessage)
      .then((result) => {
        console.log(`Chat success with model: ${modelName}`);
        return result;
      })
      .catch((err) => {
        console.warn(`Model ${modelName} failed:`, err.message);
        throw err;
      })
  );

  try {
    return await Promise.any(attempts);
  } catch {
    // Free models often hit 429 — retry sequentially with a short pause
    for (const modelName of MODEL_CANDIDATES) {
      await sleep(900);
      try {
        const result = await callOpenRouterModel(modelName, apiKey, systemPrompt, userMessage);
        console.log(`Chat success on sequential retry with model: ${modelName}`);
        return result;
      } catch (err) {
        console.warn(`Sequential retry failed for ${modelName}:`, err.message);
      }
    }
    throw new Error('All model attempts failed');
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

  const apiKey = (process.env.OPEN_ROUTER_KEY || '').trim();
  if (!apiKey) {
    return res.status(500).json({ error: 'OpenRouter API key is not configured on the server.' });
  }

  try {
    const systemPrompt = getSystemPrompt();
    const { replyText } = await getFastestModelReply(apiKey, systemPrompt, userMessage);
    return res.status(200).json(parseModelResponse(replyText));
  } catch (err) {
    console.error('All chat model attempts failed:', err);
    return res.status(502).json({
      error: 'AI is taking too long right now. Please try again in a few seconds.',
    });
  }
}

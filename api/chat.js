import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const MAX_MESSAGE_LENGTH = 500;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 10;

const rateLimitStore = new Map();

const MODEL_CANDIDATES = [
  'nvidia/nemotron-3-super-120b-a12b:free',
  'google/gemma-4-26b-a4b-it:free',
  'google/gemma-4-31b-it:free',
  'qwen/qwen3-coder:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'meta-llama/llama-3.2-3b-instruct:free',
  'liquid/lfm-2.5-1.2b-instruct:free',
];

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
      return fs.readFileSync(projectsPath, 'utf8');
    } catch {
      // Try next candidate path
    }
  }

  console.error('Failed to read projects file from known locations.');
  return 'No projects data available.';
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
            if (Array.isArray(val)) {
              formattedText += `**${formattedKey}**:\n${val.map((item) => `- ${item}`).join('\n')}\n\n`;
            } else {
              formattedText += `**${formattedKey}**: ${val}\n\n`;
            }
          }
          parsedResult.reply = formattedText.trim() || 'Here is the information I retrieved.';
        }
      }

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
    const projectsData = loadProjectsData();

    const systemPrompt = `You are a friendly portfolio guide for Fakhri Budiman. Your job is to answer questions about Fakhri's projects, experience, skills, and background in a warm, natural, and concise manner.

Here is Fakhri's core profile:
- Role: Data Analyst & AI Enthusiast based in Indonesia.
- Education: MSc Business Analytics at University of Warwick (UK), specializing in Machine Learning, SQL, Python, Generative AI, and Data Visualization.
- Key Skills: SQL, PostgreSQL, BigQuery, Tableau, Power BI, Looker Studio, Python, Machine Learning, Deep Learning, Generative AI, LLM Fine-tuning, RAG, Figma, Adobe Illustrator.

Here is the COMPLETE and CURRENT DATABASE of Fakhri's Projects and Experience:
${projectsData}

NAVIGATION ROUTING INSTRUCTIONS:
If the user asks to see or navigate to a specific section of the website, you must identify the intent and respond with a specific action.
Valid sections and their triggers:
- If user asks about skills, programming languages, or tools -> Action: "navigate_to_skills"
- If user asks about education, experience, Warwick, or career -> Action: "navigate_to_experience"
- If user asks about projects, portfolios, case studies, or coding -> Action: "navigate_to_projects"
- If user asks about contact, social media, linkedin, or email -> Action: "navigate_to_contact"
- Otherwise -> Action: null

LINK FORMATTING:
When sharing URLs (LinkedIn, GitHub, portfolio, email, etc.), NEVER paste raw URLs alone.
Always use markdown hyperlinks with a clean label, for example:
- [LinkedIn](https://linkedin.com/in/muhammad-fakhri-musyaffa-budiman)
- [GitHub](https://github.com/fbudimannn)
- [Portfolio](https://fakhri-budiman-portfolio.vercel.app)
- [Email](mailto:fakhribudiman1721@gmail.com)
You may also use the format "LinkedIn: https://..." and the UI will convert it to a hyperlink.

RESPONSE FORMAT:
You MUST respond ONLY in a valid JSON format. Do not write any markdown outside the JSON block.
JSON format structure:
{
  "reply": "Your conversational answer to the user in friendly English based on the projects database.",
  "action": "navigate_to_skills" | "navigate_to_experience" | "navigate_to_projects" | "navigate_to_contact" | null
}`;

    let lastError = null;
    let replyText = '';
    let responseOk = false;

    for (const modelName of MODEL_CANDIDATES) {
      try {
        console.log(`Attempting request to OpenRouter using model: ${modelName}`);
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
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
          }),
        });

        if (response.ok) {
          const data = await response.json();
          replyText = data.choices?.[0]?.message?.content;
          if (replyText) {
            responseOk = true;
            console.log(`Successfully completed chat request with model: ${modelName}`);
            break;
          }
        } else {
          const errText = await response.text();
          console.warn(`Model ${modelName} returned status ${response.status}: ${errText}`);
          lastError = `Status ${response.status}: ${errText}`;
        }
      } catch (err) {
        console.error(`Error requesting model ${modelName}:`, err);
        lastError = err.message;
      }
    }

    if (!responseOk) {
      console.error('All OpenRouter model candidates failed:', lastError);
      return res.status(502).json({
        error: 'AI service is temporarily unavailable. Please try again shortly.',
      });
    }

    return res.status(200).json(parseModelResponse(replyText));
  } catch (err) {
    console.error('Chat API Error:', err);
    return res.status(500).json({ error: 'Unexpected server error while processing your message.' });
  }
}

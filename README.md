# Fakhri Budiman — Portfolio

A cinematic, scroll-based personal portfolio built with modern web technologies.

![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP-88CE02?style=for-the-badge&logo=greensock&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=threedotjs&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

## ✨ Features

- **Cinematic Preloader** — Split-door gate with loading progress bar, status text cycling, and warp speed star effect
- **3D Star Field** — Three.js particle system with twinkling stars, mouse parallax, and scroll-depth camera movement
- **Dynamic Skill Bubbles** — 22 skills cycling in batches of 10, draggable with mouse interaction
- **GSAP Animations** — Character-staggered title entrance, section scroll transitions with blur/fade, and smooth parallax effects
- **Custom Cursor** — Dual-element cursor (dot + ring) with hover scaling, automatically disabled on touch devices
- **Greeting Rotator** — Cycles through 20 languages including Japanese, Korean, Arabic, Hindi, and more
- **Fully Responsive** — Optimized layouts for desktop, tablet, and mobile
- **Glassmorphism UI** — Frosted glass cards with gradient borders and subtle glow effects
- **AI Chatbot Assistant** — Floating widget powered by OpenRouter (NVIDIA Nemotron + free-model fallbacks), with project-aware answers and auto-navigation to site sections

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| **Vite** | Build tool & dev server |
| **GSAP + ScrollTrigger** | Animations & scroll-driven effects |
| **Three.js** | 3D particle star field background |
| **Vanilla CSS** | Custom design system with CSS variables |
| **Google Fonts** | Syne, Space Mono, DM Sans |
| **OpenRouter API** | LLM gateway for the portfolio chatbot |

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Configure environment (local only)
cp .env.example .env
# Then set OPEN_ROUTER_KEY in .env

# Start development server
npm run dev

# Build for production
npm run build
```

## 🤖 AI Chatbot Setup

The chatbot uses a server-side API route at `/api/chat` so your OpenRouter key never reaches the browser.

### Local development

1. Create `.env` from `.env.example`
2. Add your `OPEN_ROUTER_KEY` from [OpenRouter](https://openrouter.ai/)
3. Run `npm run dev`
4. Open the site and click the floating **AI** button, or run:

```bash
npm run test:chat
```

### Vercel deployment

1. Push the repo to GitHub
2. In Vercel → **Project Settings → Environment Variables**, add:
   - `OPEN_ROUTER_KEY` = your OpenRouter API key
3. Redeploy the project
4. Test production:

```bash
npm run test:chat:vercel
```

`vercel.json` bundles `docs/projects_data_compiled.md` into the serverless function so the chatbot can answer from your project database in production.

## 📁 Project Structure

```
├── api/
│   └── chat.js             # Serverless chat endpoint (OpenRouter)
├── docs/
│   └── projects_data_compiled.md
├── public/
│   ├── fakhri.png          # Hero photo
│   └── chatbot_logo.json   # Chatbot Lottie asset
├── src/
│   ├── main.js             # Core animation logic + chatbot UI
│   ├── three-bg.js         # Three.js star field + warp
│   └── style.css           # Design system & styles
├── test/
│   └── chat.mjs            # CLI test helper for /api/chat
├── index.html              # Main HTML structure
├── vercel.json             # Vercel build + serverless config
├── package.json
└── vite.config.js
```

## 📄 License

© 2026 Fakhri Budiman. All rights reserved.

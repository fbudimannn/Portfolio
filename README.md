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

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| **Vite** | Build tool & dev server |
| **GSAP + ScrollTrigger** | Animations & scroll-driven effects |
| **Three.js** | 3D particle star field background |
| **Vanilla CSS** | Custom design system with CSS variables |
| **Google Fonts** | Syne, Space Mono, DM Sans |

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📁 Project Structure

```
├── public/
│   └── fakhri.png          # Hero photo
├── src/
│   ├── main.js             # Core animation logic
│   ├── three-bg.js         # Three.js star field + warp
│   └── style.css           # Design system & styles
├── index.html              # Main HTML structure
├── package.json
└── vite.config.js
```

## 📄 License

© 2026 Fakhri Budiman. All rights reserved.

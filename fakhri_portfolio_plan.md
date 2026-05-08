# 🚀 Fakhri Budiman — Cinematic 3D Portfolio: Implementation Plan

> A scroll-based cinematic web portfolio powered by Three.js + GSAP + ScrollTrigger.
> One continuous scene. Zero page reloads. Full immersion.

---

## 🎯 Vision Statement

Your portfolio is not a page — it's a **data journey**. The visitor flies through a 3D world where each scroll reveals a new chapter of your story: from a dramatic hero landing, through your skills universe, your timeline, your projects, and finally your contact.

Think of it as **a sci-fi data cosmos** — dark space background, glowing particles, floating data bubbles, and a center-stage you.

---

## 🧱 Tech Stack

| Layer | Library | Purpose |
|---|---|---|
| 3D Renderer | `three.js` r160+ | 3D scene, particles, geometry |
| Animation | `gsap` 3.x | Timelines, easing, scroll control |
| Scroll Engine | `gsap/ScrollTrigger` | Scroll → animation mapping |
| Depth / Parallax | `gsap/parallax` + Three camera | Z-axis camera movement |
| Fonts | Google Fonts (Syne + Space Mono) | Display + mono pairing |
| Bundler | Vite | Fast HMR dev environment |
| Deploy | Vercel / Netlify | One-click deploy |

---

## 📁 Project Structure

```
fakhri-portfolio/
├── public/
│   ├── fakhri.png            ← Your cutout photo (remove bg first)
│   ├── video_background.mp4  ← Your uploaded video
│   └── fonts/
├── src/
│   ├── main.js               ← Entry point
│   ├── scene.js              ← Three.js scene setup
│   ├── sections/
│   │   ├── hero.js           ← Section 1: Landing
│   │   ├── skills.js         ← Section 2: Floating skill bubbles
│   │   ├── timeline.js       ← Section 3: Experience timeline
│   │   ├── projects.js       ← Section 4: Project cards
│   │   └── contact.js        ← Section 5: Contact
│   ├── animations/
│   │   ├── scrollTimeline.js ← Master GSAP ScrollTrigger config
│   │   ├── particles.js      ← Background particle field
│   │   └── camera.js         ← Camera path / parallax
│   └── style.css
├── index.html
├── vite.config.js
└── package.json
```

---

## 🎬 Section-by-Section Animation Plan

---

### SECTION 1 — Hero Landing

**Concept:** The page loads in darkness. A video fades in behind a translucent overlay. Your photo materializes from particles converging in the center. The greeting word cycles through languages with a typewriter dissolve.

**Elements:**
- Background: `video_background.mp4` playing as a `<video>` element behind the Three.js canvas, crossfade on load
- Your photo: PNG with background removed, centered, scales up from `0.6` → `1.0` on load
- Greeting word: cycles → `Hello` → `Hola` → `Olá` → `Olla` → `Anyoung` → `Ciao` → `Hei` → `こんにちは`
- Title: `WELCOME TO MY PORTFOLIO` — letters stagger in from below
- Subtitle: `Fakhri Budiman · Data & AI Enthusiast`
- Floating bubbles: 6 ellipse bubbles with skill words, drifting with CSS `keyframe` float animation

**GSAP prompt:**
```js
// Hero entrance timeline
const heroTL = gsap.timeline({ defaults: { ease: "expo.out", duration: 1.2 } });

heroTL
  .fromTo(".video-bg", { opacity: 0 }, { opacity: 0.6 })
  .fromTo(".photo", { scale: 0.5, opacity: 0, filter: "blur(20px)" },
                    { scale: 1, opacity: 1, filter: "blur(0px)" }, "-=0.6")
  .fromTo(".greeting", { opacity: 0, y: 30 }, { opacity: 1, y: 0 }, "-=0.8")
  .fromTo(".title .char", { y: 80, opacity: 0 },
    { y: 0, opacity: 1, stagger: 0.04 }, "-=0.6")
  .fromTo(".bubble", { scale: 0, opacity: 0 },
    { scale: 1, opacity: 1, stagger: 0.12, ease: "back.out(2)" }, "-=0.4");
```

**Three.js prompt:**
```js
// Particle burst converging to photo position
const particles = new THREE.Points(particleGeo, particleMat);
// On load: animate particles from random sphere → converge to center
gsap.to(particles.position, { x: 0, y: 0, z: 0, duration: 2, ease: "power4.out" });
```

---

### SECTION 2 — Skills Universe

**Concept:** Scroll down → camera pulls back to reveal a 3D constellation of skill nodes floating in space. Each node is a glowing sphere with a label. Grouped by category: Soft Skills, Technical Skills, Toolset.

**Skill Nodes:**

| Group | Color | Skills |
|---|---|---|
| Soft Skills | `#38bdf8` (sky blue) | Teamwork, Detail-Oriented, Fast Learner, Analytical Thinking, Growth Mindset, Problem Solver, Leadership |
| Technical | `#a78bfa` (violet) | SQL, PostgreSQL, Machine Learning, Deep Learning, Data Visualisation, Excel, Generative AI (LLM Fine-tuning, RAG), Forecasting, A/B Testing |
| Toolset | `#34d399` (emerald) | Tableau, Power BI, Looker Studio, Adobe Illustrator, Figma, Python, BigQuery, Slack, RStudio, Streamlit |

**GSAP ScrollTrigger prompt:**
```js
ScrollTrigger.create({
  trigger: "#skills",
  start: "top bottom",
  end: "bottom top",
  scrub: 1.5,
  onUpdate: (self) => {
    // Camera pulls back on Z-axis
    camera.position.z = THREE.MathUtils.lerp(5, 20, self.progress);
    // Nodes orbit + scale in
    skillNodes.forEach((node, i) => {
      node.rotation.y = self.progress * Math.PI * 2 * (i % 2 === 0 ? 1 : -1);
    });
  }
});
```

**Floating bubble CSS (apply to each):**
```css
@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33%       { transform: translateY(-18px) rotate(1.5deg); }
  66%       { transform: translateY(10px) rotate(-1deg); }
}
.bubble { animation: float 6s ease-in-out infinite; }
.bubble:nth-child(2n) { animation-duration: 8s; animation-delay: -2s; }
.bubble:nth-child(3n) { animation-duration: 5s; animation-delay: -4s; }
```

---

### SECTION 3 — Experience Timeline

**Concept:** Camera moves left-to-right on a horizontal rail. Each stop = a role. Timeline nodes pulse like data packets travelling along a wire.

**Timeline entries:**
1. **University of Warwick** — MSc Business Analytics | Sep 2024–Sep 2025 | Merit | LPDP Scholar
2. **RevoU** — Team Lead Full Stack Data Analytics | Sep 2023–Sep 2024 | 5.0/5.0 satisfaction
3. **RevoU** — Data Analyst Associate | Jan–Apr 2023 | KPI Dashboards, Market Basket
4. **Telkom University** — BSc International ICT Business | 2017–2021 | 3.68 GPA | Cum Laude | Korea exchange

**GSAP horizontal scroll prompt:**
```js
const panels = gsap.utils.toArray(".timeline-panel");

gsap.to(panels, {
  xPercent: -100 * (panels.length - 1),
  ease: "none",
  scrollTrigger: {
    trigger: "#timeline",
    pin: true,
    scrub: 1,
    snap: 1 / (panels.length - 1),
    end: () => "+=" + document.querySelector("#timeline").offsetWidth
  }
});
```

**Three.js camera rail prompt:**
```js
// Camera follows a CatmullRom curve left → right
const railCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-15, 0, 8),
  new THREE.Vector3(0, 0, 8),
  new THREE.Vector3(15, 0, 8),
]);

ScrollTrigger.create({
  trigger: "#timeline",
  scrub: true,
  onUpdate: (self) => {
    const pt = railCurve.getPoint(self.progress);
    camera.position.set(pt.x, pt.y, pt.z);
    camera.lookAt(pt.x, 0, 0);
  }
});
```

---

### SECTION 4 — Projects

**Concept:** Projects fall from above like holographic data cards. Hover = card tilts in 3D with a glow highlight. Click = expands to full info.

**Projects list (from your PDF):**
1. RFM Segmentation — EcommerceU customer segmentation (Python, BigQuery, Tableau)
2. End-to-End Analysis — Multi-industry pipelines
3. Unsupervised Learning — Clustering models
4. Supervised Learning — Predictive models
5. Generative AI — LLM Fine-tuning / RAG
6. End-to-End Database Building
7. A/B Testing
8. Data Visualization
9. Customer Behaviour Analysis (9 side projects)

**Card tilt on hover (CSS + JS):**
```js
document.querySelectorAll(".project-card").forEach(card => {
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    gsap.to(card, {
      rotationY: x * 25,
      rotationX: -y * 25,
      transformPerspective: 600,
      ease: "power2.out",
      duration: 0.4
    });
  });
  card.addEventListener("mouseleave", () => {
    gsap.to(card, { rotationY: 0, rotationX: 0, duration: 0.6, ease: "elastic.out(1, 0.5)" });
  });
});
```

**ScrollTrigger card drop:**
```js
gsap.from(".project-card", {
  y: -200,
  opacity: 0,
  rotationX: 90,
  stagger: 0.15,
  ease: "bounce.out",
  duration: 1.2,
  scrollTrigger: {
    trigger: "#projects",
    start: "top 70%",
  }
});
```

---

### SECTION 5 — Contact

**Concept:** The scene zooms all the way in to a glowing terminal. Your contact info types itself out. A soft particle nebula surrounds it.

**Elements:**
- Typewriter effect: `fakhribudiman@email.com` types itself
- LinkedIn / GitHub / Email buttons — neon glow pulse
- Closing line: `"You can have data without information, but you cannot have information without data." — Daniel Keys Moran`

---

## 🌐 Greeting Rotator — Full Implementation

```js
const greetings = [
  { text: "Hello,",    lang: "English" },
  { text: "Hola,",     lang: "Spanish" },
  { text: "Olla,",     lang: "Portuguese" },
  { text: "Olá,",      lang: "Brazilian" },
  { text: "Anyoung,",  lang: "Korean" },
  { text: "Ciao,",     lang: "Italian" },
  { text: "Hei,",      lang: "Norwegian" },
  { text: "مرحبا,",    lang: "Arabic" },
  { text: "こんにちは,", lang: "Japanese" },
  { text: "你好,",      lang: "Chinese" },
  { text: "Halo,",     lang: "Indonesian" },
];

let current = 0;
const el = document.querySelector(".greeting-word");

function cycleGreeting() {
  gsap.to(el, {
    opacity: 0, y: -20, duration: 0.4, ease: "power2.in",
    onComplete: () => {
      current = (current + 1) % greetings.length;
      el.textContent = greetings[current].text;
      gsap.fromTo(el,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      );
    }
  });
}
setInterval(cycleGreeting, 2200);
```

---

## 🎨 Color Palette & Typography

```css
:root {
  --bg:         #050510;     /* Near-black deep space */
  --surface:    #0d0d1f;     /* Card backgrounds */
  --accent-1:   #38bdf8;     /* Sky blue — soft skills */
  --accent-2:   #a78bfa;     /* Violet — technical */
  --accent-3:   #34d399;     /* Emerald — toolset */
  --accent-hot: #f97316;     /* Orange — highlights */
  --text:       #e2e8f0;
  --muted:      #64748b;

  --font-display: 'Syne', sans-serif;     /* Headers */
  --font-mono:    'Space Mono', monospace; /* Code, labels */
  --font-body:    'DM Sans', sans-serif;   /* Body text */
}
```

Google Fonts import:
```html
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Space+Mono&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
```

---

## ⚙️ Setup Commands (Antigravity / Vite)

```bash
# 1. Create Vite project
npm create vite@latest fakhri-portfolio -- --template vanilla
cd fakhri-portfolio

# 2. Install core dependencies
npm install three gsap

# 3. Install dev tools
npm install -D vite @vitejs/plugin-legacy

# 4. Run dev server
npm run dev
```

**package.json dependencies:**
```json
{
  "dependencies": {
    "three": "^0.160.0",
    "gsap": "^3.12.5"
  }
}
```

**GSAP ScrollTrigger import (inside your JS):**
```js
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
```

**Three.js base scene setup:**
```js
import * as THREE from "three";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

camera.position.z = 5;

// Ambient + directional lighting
const ambient = new THREE.AmbientLight(0xffffff, 0.4);
const directional = new THREE.DirectionalLight(0x38bdf8, 1.2);
directional.position.set(5, 5, 5);
scene.add(ambient, directional);

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
```

---

## 💡 Depth & Parallax Prompts

### Mouse-tracked parallax (hero section)
```js
document.addEventListener("mousemove", (e) => {
  const x = (e.clientX / window.innerWidth - 0.5) * 2;
  const y = (e.clientY / window.innerHeight - 0.5) * 2;

  gsap.to(camera.rotation, {
    x: -y * 0.08,
    y: x * 0.08,
    duration: 1.2,
    ease: "power2.out"
  });

  // Parallax layers at different depths
  gsap.to(".layer-far",  { x: x * -15, y: y * -10, duration: 1 });
  gsap.to(".layer-mid",  { x: x * -30, y: y * -20, duration: 1 });
  gsap.to(".layer-near", { x: x * -50, y: y * -35, duration: 1 });
});
```

### Scroll-driven camera zoom
```js
ScrollTrigger.create({
  trigger: "body",
  start: "top top",
  end: "bottom bottom",
  scrub: 2,
  onUpdate: (self) => {
    // Zoom out as user scrolls down
    camera.fov = THREE.MathUtils.lerp(60, 90, self.progress);
    camera.updateProjectionMatrix();
  }
});
```

---

## 🌟 Particle Field (Background Stars)

```js
function createParticleField(count = 3000) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  const palette = [
    new THREE.Color("#38bdf8"),
    new THREE.Color("#a78bfa"),
    new THREE.Color("#34d399"),
    new THREE.Color("#ffffff"),
  ];

  for (let i = 0; i < count; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 200;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 200;

    const c = palette[Math.floor(Math.random() * palette.length)];
    colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color",    new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.3,
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
    sizeAttenuation: true,
  });

  return new THREE.Points(geometry, material);
}

scene.add(createParticleField());
```

---

## 🎥 Video Background Integration

```html
<!-- index.html -->
<div class="video-container">
  <video id="bg-video" autoplay muted loop playsinline>
    <source src="/video_background.mp4" type="video/mp4">
  </video>
</div>
<canvas id="three-canvas"></canvas>
```

```css
.video-container {
  position: fixed;
  inset: 0;
  z-index: -2;
  overflow: hidden;
}
.video-container video {
  width: 100%; height: 100%;
  object-fit: cover;
  opacity: 0;  /* GSAP fades this in */
  transition: opacity 0.5s;
}
#three-canvas {
  position: fixed;
  inset: 0;
  z-index: -1;
}
```

```js
// Fade in video after page load
window.addEventListener("load", () => {
  gsap.to("#bg-video", { opacity: 0.5, duration: 2, ease: "power2.out" });
});
```

---

## 📋 Section HTML Skeleton

```html
<body>
  <!-- ======================== HERO ======================== -->
  <section id="hero">
    <h1 class="greeting-word">Hello,</h1>
    <h1 class="title">WELCOME TO MY PORTFOLIO</h1>
    <img src="/fakhri.png" class="photo" alt="Fakhri Budiman" />
    <p class="subtitle">Fakhri Budiman · Data & AI Enthusiast</p>

    <!-- Floating skill bubbles -->
    <div class="bubble" style="--delay:0s">Machine Learning</div>
    <div class="bubble" style="--delay:0.8s">SQL</div>
    <div class="bubble" style="--delay:1.6s">Python</div>
    <div class="bubble" style="--delay:2.4s">Generative AI</div>
    <div class="bubble" style="--delay:3.2s">Power BI</div>
    <div class="bubble" style="--delay:4s">Tableau</div>
  </section>

  <!-- ======================= SKILLS ======================= -->
  <section id="skills">
    <h2>My Universe of Skills</h2>
    <div class="skill-constellation" id="three-skills"></div>
  </section>

  <!-- ====================== TIMELINE ====================== -->
  <section id="timeline">
    <div class="timeline-track">
      <div class="timeline-panel" data-year="2024–2025">
        <h3>University of Warwick</h3>
        <p>MSc Business Analytics · Merit · LPDP Scholar</p>
      </div>
      <div class="timeline-panel" data-year="2023–2024">
        <h3>RevoU — Team Lead</h3>
        <p>Full Stack Data Analytics · 5.0/5.0 satisfaction</p>
      </div>
      <div class="timeline-panel" data-year="2023">
        <h3>RevoU — Data Analyst</h3>
        <p>KPI Dashboards · Market Basket · A/B Testing</p>
      </div>
      <div class="timeline-panel" data-year="2017–2021">
        <h3>Telkom University</h3>
        <p>BSc ICT Business · 3.68 GPA · Cum Laude · Korea Exchange</p>
      </div>
    </div>
  </section>

  <!-- ====================== PROJECTS ====================== -->
  <section id="projects">
    <h2>Projects</h2>
    <div class="projects-grid">
      <!-- Repeat for each project -->
      <div class="project-card">
        <h3>RFM Segmentation</h3>
        <p>EcommerceU · Python · BigQuery · Tableau</p>
        <span class="tag">Customer Behaviour</span>
      </div>
    </div>
  </section>

  <!-- ====================== CONTACT ====================== -->
  <section id="contact">
    <div class="terminal">
      <p class="typewriter">fakhribudiman@email.com</p>
      <div class="social-links">
        <a href="#">LinkedIn</a>
        <a href="#">GitHub</a>
      </div>
    </div>
    <blockquote>
      "You can have data without information, but you cannot have
      information without data." — Daniel Keys Moran
    </blockquote>
  </section>
</body>
```

---

## 🔄 Master ScrollTrigger Timeline

```js
// scrollTimeline.js — wire everything together

import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

export function initScrollTimeline() {

  // HERO → SKILLS transition: particles scatter outward
  ScrollTrigger.create({
    trigger: "#skills",
    start: "top 80%",
    onEnter: () => scatterParticles(),  // your Three.js fn
  });

  // SKILLS section: rotate constellation
  ScrollTrigger.create({
    trigger: "#skills",
    start: "top bottom",
    end: "bottom top",
    scrub: 1.5,
    onUpdate: (self) => rotateConstellation(self.progress),
  });

  // TIMELINE: horizontal scrub
  const panels = gsap.utils.toArray(".timeline-panel");
  gsap.to(panels, {
    xPercent: -100 * (panels.length - 1),
    ease: "none",
    scrollTrigger: {
      trigger: "#timeline",
      pin: true,
      scrub: 1,
      snap: 1 / (panels.length - 1),
      end: () => "+=" + window.innerWidth * (panels.length - 1)
    }
  });

  // PROJECTS: stagger card drop
  gsap.from(".project-card", {
    y: -200, opacity: 0, rotationX: 90, stagger: 0.15,
    ease: "bounce.out", duration: 1.2,
    scrollTrigger: { trigger: "#projects", start: "top 70%" }
  });

  // CONTACT: typewriter
  ScrollTrigger.create({
    trigger: "#contact",
    start: "top 60%",
    once: true,
    onEnter: () => startTypewriter(".typewriter"),
  });
}
```

---

## 📐 Responsive Considerations

```js
// Disable heavy 3D on mobile for performance
const isMobile = window.innerWidth < 768;

if (isMobile) {
  renderer.setPixelRatio(1);
  // Reduce particle count
  particleCount = 800;
  // Disable ScrollTrigger scrub on timeline (use click instead)
}

// Resize handler
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  ScrollTrigger.refresh();
});
```

---

## ✅ Build Checklist

- [ ] Remove background from your photo (use `remove.bg` or Figma)
- [ ] Compress `video_background.mp4` → target < 5MB (use HandBrake or FFmpeg)
- [ ] Install dependencies: `npm install three gsap`
- [ ] Set up `scene.js` with base Three.js renderer
- [ ] Add particle field to scene
- [ ] Build hero section HTML + CSS
- [ ] Implement greeting rotator JS
- [ ] Add floating skill bubbles with CSS animation
- [ ] Wire ScrollTrigger on skills section
- [ ] Build horizontal timeline scrub
- [ ] Add project cards with tilt interaction
- [ ] Add contact typewriter effect
- [ ] Test on mobile — reduce particle count if laggy
- [ ] Deploy to Vercel: `vercel --prod`

---

## 🌍 Deployment (Vercel)

```bash
npm install -g vercel
vercel login
vercel          # Follow prompts — auto-detects Vite
vercel --prod   # Production deploy
```

Your site will be live at `https://fakhri-portfolio.vercel.app`

---

*Built with Three.js · GSAP · ScrollTrigger · Vite · Made in Indonesia 🇮🇩*

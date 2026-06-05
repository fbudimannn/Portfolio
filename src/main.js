import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import lottie from 'lottie-web';
import { initThreeBackground, triggerWarp, pauseThreeBackground, resumeThreeBackground } from './three-bg.js';
import { initWarpTransition } from './warp-transition.js';
import { projectsData } from './projectsData.js';

// Expose Lottie globally to support inline scripts (e.g. index.html)
window.lottie = lottie;

// Lottie JSON assets are fetched dynamically at runtime to optimize bundle size

gsap.registerPlugin(ScrollTrigger);

// Expose GSAP globally so inline scripts in index.html can use it
window.gsap = gsap;
window.triggerWarp = triggerWarp;

document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initCustomCursor();
  initThreeBackground();
  initNavigation();
  initGreetingRotator();
  initHeroAnimations();
  initSkillBubbles();
  initScrollProgress();
  initSectionTransitions();
  initSkillsAnimations();
  initTimelineAnimations();
  initProjectCards();
  initContactSection();
  initVideoBackground();
  initMusicPlayer();
  initScifiTypingQuote();
  initMagicPortals();
  initHeaderAnimations();
  initWarpTransition();
  initSpaceRoomScroll();
  initLottieAnimations();
});

/* ============ CUSTOM CURSOR ============ */
function initCustomCursor() {
  // Skip on touch devices
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    // Dot follows instantly
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';
  });

  // Ring follows with smooth lag
  function animateRing() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Hover effect on interactive elements
  const hoverTargets = document.querySelectorAll(
    'a, button, .project-card, .nav-link, .social-link, .hero-cta, .skill-tag, .nav-toggle'
  );
  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => {
      dot.classList.add('hover');
      ring.classList.add('hover');
    });
    el.addEventListener('mouseleave', () => {
      dot.classList.remove('hover');
      ring.classList.remove('hover');
    });
  });

  // Hide cursor when leaving window
  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity = '1';
    ring.style.opacity = '1';
  });
}

/* ============ SECTION SCROLL TRANSITIONS ============ */
function initSectionTransitions() {
  // Each section fades/blurs out as you scroll past it
  const sections = document.querySelectorAll('.section');

  sections.forEach((section) => {
    // Skip the last section (contact) — nothing to transition into
    const isLast = section === sections[sections.length - 1];

    // EXIT animation: fade out + shift up + blur as you leave
    ScrollTrigger.create({
      trigger: section,
      start: 'bottom 50%', // Delay the start of the blur until section is halfway up the screen
      end: 'bottom 0%',
      scrub: 0.6,
      onUpdate: (self) => {
        if (isLast) return;
        const p = self.progress; // 0 → 1 as section exits
        gsap.set(section, {
          opacity: 1 - p * 0.7,
          y: -p * 20, // Less vertical shift
          filter: `blur(${p * 2}px)`, // Less intense blur
          scale: 1 - p * 0.02,
        });
      },
      onLeave: () => {
        if (!isLast) {
          gsap.set(section, { opacity: 0.3, filter: 'blur(2px)' });
        }
      },
      onEnterBack: () => {
        gsap.set(section, { opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 });
      },
    });
  });
}

/* ============ PRELOADER — SPLIT DOOR GATE ============ */
function initPreloader() {
  const preloader = document.getElementById('preloader');
  const barFill = document.getElementById('gate-bar-fill');
  const gateText = document.getElementById('gate-text');

  const stages = [
    { text: 'INITIALIZING', at: 0 },
    { text: 'LOADING ASSETS', at: 15 },
    { text: 'PREPARING SCENE', at: 40 },
    { text: 'ALMOST READY', at: 70 },
    { text: 'WELCOME', at: 95 },
  ];

  let progress = 0;
  let stageIdx = 0;

  // Simulate loading progress
  function tickProgress() {
    const speed = 0.8 + Math.random() * 2.5;
    progress = Math.min(progress + speed, 100);
    if (barFill) barFill.style.width = progress + '%';

    // Update status text at milestones
    if (stageIdx < stages.length - 1 && progress >= stages[stageIdx + 1].at) {
      stageIdx++;
      if (gateText) {
        gsap.to(gateText, {
          opacity: 0, y: -8, duration: 0.15,
          onComplete: () => {
            gateText.textContent = stages[stageIdx].text;
            gsap.to(gateText, { opacity: 1, y: 0, duration: 0.2 });
          }
        });
      }
    }

    if (progress < 100) {
      requestAnimationFrame(tickProgress);
    }
  }

  function openGate() {
    const tl = gsap.timeline();

    // Stage 1: Trigger warp speed & spin rings faster
    tl.add(() => {
      triggerWarp();
    })
      .to('.radar-ring-1', { rotation: 1080, duration: 1.5, ease: 'power2.in' }, 0)
      .to('.radar-ring-2', { rotation: -1080, duration: 1.5, ease: 'power2.in' }, 0)
      .to('.telemetry', { opacity: 0, stagger: 0.1, duration: 0.2 }, 0)
      // Stage 2: Logo glows intensely
      .to('.gate-logo', {
        textShadow: '0 0 60px rgba(56,189,248,0.8), 0 0 120px rgba(59,130,246,0.6)',
        scale: 1.2,
        color: '#fff',
        duration: 0.6,
        ease: 'power2.out',
      }, 0.2)
      // Stage 3: Hold for warp effect
      .to('.gate-bar', { opacity: 0, duration: 0.3 }, '-=0.3')
      .to('.gate-text', { opacity: 0, duration: 0.2 }, '-=0.2')
      // Stage 4: Center content fades with warp blur
      .to('.gate-logo-wrapper, .radar-ring', {
        opacity: 0, scale: 2.5, filter: 'blur(10px)',
        duration: 0.5, ease: 'power2.in',
      })
      .to('.gate-line', {
        opacity: 0, duration: 0.2,
      }, '-=0.4')
      // Stage 5: Flash of white light
      .to('.gate-left, .gate-right', {
        borderColor: 'rgba(255,255,255,0.3)',
        boxShadow: 'inset 0 0 80px rgba(255,255,255,0.05)',
        duration: 0.3,
      })
      // Stage 6: Doors split apart
      .to('.gate-left', {
        xPercent: -100,
        duration: 0.8,
        ease: 'power4.inOut',
      })
      .to('.gate-right', {
        xPercent: 100,
        duration: 0.8,
        ease: 'power4.inOut',
      }, '-=0.8')
      // Stage 7: Cleanup and hero entrance
      .add(() => {
        preloader.classList.add('hidden');
        animateHeroEntrance();
      });
  }

  window.addEventListener('load', () => {
    // Start loading animation
    tickProgress();
    // Wait for bar to fill, then open
    setTimeout(openGate, 2200);
  });

  if (document.readyState === 'complete') {
    tickProgress();
    setTimeout(openGate, 2500);
  }
}

/* ============ VIDEO BACKGROUND (reveal on scroll) ============ */
function initVideoBackground() {
  const video = document.getElementById('bg-video');
  const container = document.querySelector('.video-container');
  if (video) {
    video.play().catch(() => { });
  }
  if (container) {
    ScrollTrigger.create({
      trigger: '#skills',
      start: 'top 80%',
      onEnter: () => container.classList.add('visible'),
      onLeaveBack: () => container.classList.remove('visible'),
    });
  }
}

/* ============ NAVIGATION ============ */
function initNavigation() {
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');
  const navLinkEls = document.querySelectorAll('.nav-link');

  // Scroll → glassmorphism
  ScrollTrigger.create({
    trigger: 'body',
    start: 'top -80px',
    onEnter: () => nav.classList.add('scrolled'),
    onLeaveBack: () => nav.classList.remove('scrolled'),
  });

  // Mobile toggle
  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    links.classList.toggle('open');
  });

  // Smooth scroll + close mobile menu
  navLinkEls.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const target = document.querySelector(targetId);
      if (target) {
        const offset = nav.offsetHeight + 10;
        const y = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
      toggle.classList.remove('active');
      links.classList.remove('open');
    });
  });

  // Active link on scroll
  const sections = document.querySelectorAll('.section');
  sections.forEach(section => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top center',
      end: 'bottom center',
      onEnter: () => setActiveNav(section.id),
      onEnterBack: () => setActiveNav(section.id),
    });
  });

  function setActiveNav(id) {
    navLinkEls.forEach(l => l.classList.remove('active'));
    const active = document.querySelector(`.nav-link[data-section="${id}"]`);
    if (active) active.classList.add('active');
  }
}

/* ============ GREETING ROTATOR ============ */
let greetingInterval = null;
function initGreetingRotator() {
  // Don't start cycling yet — wait for hero entrance to call startGreetingRotator()
}

function startGreetingRotator() {
  if (greetingInterval) return; // already running
  const greetings = [
    'Hello,',       // English
    'Hola,',        // Spanish
    'Olá,',         // Portuguese
    'Bonjour,',     // French
    'Hallo,',       // German
    'Ciao,',        // Italian
    'Hej,',         // Swedish
    'Hei,',         // Norwegian
    'Merhaba,',     // Turkish
    'Halo,',        // Indonesian
    'Sawadee,',     // Thai
    'Xin chào,',    // Vietnamese
    'Namaste,',     // Hindi
    '안녕하세요,',     // Korean
    'こんにちは,',     // Japanese
    '你好,',         // Chinese
    'مرحبا,',       // Arabic
    'Привет,',      // Russian
    'Aloha,',       // Hawaiian
    'Jambo,',       // Swahili
  ];

  let current = 0;
  const el = document.getElementById('greeting-word');
  if (!el) return;

  greetingInterval = setInterval(() => {
    gsap.to(el, {
      opacity: 0, y: -20, scale: 0.9, duration: 0.35, ease: 'power2.in',
      onComplete: () => {
        current = (current + 1) % greetings.length;
        el.textContent = greetings[current];
        gsap.fromTo(el,
          { opacity: 0, y: 20, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.5)' }
        );
      }
    });
  }, 2000);
}

/* ============ HERO ENTRANCE ============ */
let heroAnimated = false;
function animateHeroEntrance() {
  if (heroAnimated) return;
  heroAnimated = true;

  const tl = gsap.timeline({
    defaults: { ease: 'expo.out' },
    onComplete: () => {
      startGreetingRotator();
      if (window.startBubbles) window.startBubbles();
      if (window.triggerMusicUI) window.triggerMusicUI();
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
      }
    }
  });

  // Split title into characters (preserve <br> tags)
  const titleEl = document.getElementById('hero-title');
  if (titleEl) {
    const html = titleEl.innerHTML;
    // Split on <br> first, then split each part into chars
    const parts = html.split(/<br\s*\/?>/i);
    titleEl.innerHTML = parts.map(part =>
      part.split('').map(c =>
        c === ' ' ? '&nbsp;' : `<span class="char">${c}</span>`
      ).join('')
    ).join('<br>');
    titleEl.style.visibility = 'visible';
  }

  // Stage 1: Greeting pops in first — you just "arrived"
  tl.fromTo('.greeting-word',
    { opacity: 0, scale: 0.5, x: -30 },
    { opacity: 1, scale: 1, x: 0, duration: 0.8, ease: 'back.out(2)' },
  )
    // Stage 2: Title characters stagger in
    .fromTo('.hero-title .char',
      { y: 60, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.025, duration: 0.7, ease: 'back.out(1.4)' },
      '-=0.4'
    )
    // Stage 3: Description fades in
    .fromTo('.hero-desc',
      { opacity: 0, y: 25 },
      { opacity: 1, y: 0, duration: 0.9 },
      '-=0.3'
    )
    // Stage 4: CTA button
    .fromTo('.hero-cta',
      { opacity: 0, y: 20, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.7)' },
      '-=0.5'
    )
    // Stage 5: Photo materializes from blur with silhouette
    .fromTo('.photo-silhouette',
      { scale: 0.3, opacity: 0 },
      { scale: 1, opacity: 1, duration: 1.5, ease: 'power2.out' },
      '-=1.0'
    )
    .fromTo('.hero-photo',
      { scale: 0.8, opacity: 0, x: 60 },
      { scale: 1, opacity: 1, x: 0, duration: 1.4, ease: 'power3.out', clearProps: 'filter' },
      '-=1.2'
    )
    // Stage 6: Scroll indicator
    .fromTo('.scroll-indicator',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
      '-=0.3'
    );
}

function initHeroAnimations() {
  // Parallax on mouse move (photo and silhouette)
  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;

    gsap.to('.hero-photo', { x: x * -10, y: y * -6, duration: 1.2, ease: 'power2.out' });
    gsap.to('.photo-silhouette', { x: x * -15, y: y * -10, duration: 1.5, ease: 'power2.out' });
  });

  // Scroll indicator fade out
  ScrollTrigger.create({
    trigger: '#hero',
    start: 'top top',
    end: 'bottom top',
    onUpdate: (self) => {
      gsap.to('.scroll-indicator', { opacity: 1 - self.progress * 3, duration: 0.2 });
    }
  });

  // CTA smooth scroll
  const cta = document.getElementById('hero-cta');
  if (cta) {
    cta.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector('#projects');
      if (target) {
        const y = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  }
}

/* ============ DYNAMIC SKILL BUBBLES ============ */
function initSkillBubbles() {
  const allSkills = [
    'SQL', 'PostgreSQL', 'Machine Learning', 'Deep Learning',
    'Data Visualisation', 'Excel & Pivot', 'Generative AI',
    'LLM Fine-tuning', 'RAG', 'Forecasting', 'A/B Testing',
    'UI/UX', 'Tableau', 'Power BI', 'Looker Studio',
    'Adobe Illustrator', 'Figma', 'Python', 'BigQuery',
    'Slack', 'RStudio', 'Streamlit',
  ];

  const container = document.getElementById('bubbles-container');
  if (!container) return;

  const VISIBLE = 10;
  let currentBatch = 0;
  let activeBubbles = [];
  let started = false;

  // Positions tightly around the photo (% of container)
  const positions = [
    { top: '2%', left: '15%' },
    { top: '0%', left: '55%' },
    { top: '8%', left: '85%' },
    { top: '22%', left: '0%' },
    { top: '20%', left: '75%' },
    { top: '40%', left: '5%' },
    { top: '45%', left: '82%' },
    { top: '60%', left: '0%' },
    { top: '65%', left: '78%' },
    { top: '80%', left: '20%' },
  ];

  const durations = [7, 5.5, 6.5, 8, 5, 7.5, 6, 5.8, 7.2, 6.8];
  const delays = [0, -1, -2, -3, -1.5, -4, -0.5, -2.5, -3.5, -1.8];

  function createBubble(text, idx) {
    const el = document.createElement('div');
    el.className = 'bubble';
    el.textContent = text;
    el.style.opacity = '0';
    el.style.animationDuration = durations[idx % durations.length] + 's';
    el.style.animationDelay = delays[idx % delays.length] + 's';

    const pos = positions[idx % positions.length];
    if (pos.top) el.style.top = pos.top;
    if (pos.left) el.style.left = pos.left;

    // Drag
    let isDragging = false;
    let startX, startY, origLeft, origTop;

    el.addEventListener('mousedown', (e) => {
      isDragging = true;
      el.classList.add('dragging');
      startX = e.clientX;
      startY = e.clientY;
      const rect = el.getBoundingClientRect();
      const cr = container.getBoundingClientRect();
      origLeft = rect.left - cr.left;
      origTop = rect.top - cr.top;
      el.style.left = origLeft + 'px';
      el.style.top = origTop + 'px';
      e.preventDefault();
    });

    const onMove = (e) => {
      if (!isDragging) return;
      el.style.left = (origLeft + e.clientX - startX) + 'px';
      el.style.top = (origTop + e.clientY - startY) + 'px';
    };

    const onUp = () => {
      if (isDragging) {
        isDragging = false;
        el.classList.remove('dragging');
      }
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);

    container.appendChild(el);
    return el;
  }

  function showBatch() {
    const startIdx = (currentBatch * VISIBLE) % allSkills.length;
    const batch = [];
    for (let i = 0; i < VISIBLE; i++) {
      batch.push(allSkills[(startIdx + i) % allSkills.length]);
    }

    // Fade out old
    activeBubbles.forEach((el, i) => {
      gsap.to(el, {
        opacity: 0, scale: 0.5, duration: 0.35,
        delay: i * 0.04,
        ease: 'power2.in',
        onComplete: () => el.remove(),
      });
    });

    // Create new
    setTimeout(() => {
      activeBubbles = batch.map((text, i) => {
        const el = createBubble(text, i);
        gsap.fromTo(el,
          { opacity: 0, scale: 0, y: 15 },
          {
            opacity: 1, scale: 1, y: 0,
            duration: 0.5, delay: i * 0.06,
            ease: 'elastic.out(1, 0.6)',
          }
        );
        return el;
      });
    }, 400);

    currentBatch++;
  }

  // Public: call this after hero entrance to start bubbles
  window.startBubbles = function () {
    if (started) return;
    started = true;
    // Fade in the container
    gsap.to(container, { opacity: 1, duration: 0.8 });
    showBatch();
    setInterval(showBatch, 5000);
  };
}

/* ============ SCROLL PROGRESS ============ */
function initScrollProgress() {
  gsap.to('.scroll-progress', {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: {
      trigger: 'body',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.3,
    }
  });
}

/* ============ SKILLS ANIMATIONS ============ */
function initSkillsAnimations() {
  // Section header
  gsap.from('#skills-header', {
    y: 50, opacity: 0, duration: 0.8,
    scrollTrigger: { trigger: '#skills', start: 'top 80%' }
  });

  // Skill categories stagger
  gsap.from('.skill-category', {
    y: 60, opacity: 0, duration: 0.7,
    stagger: 0.2,
    ease: 'back.out(1.4)',
    scrollTrigger: { trigger: '.skills-grid', start: 'top 80%' }
  });

  // Individual skill tags pop in
  document.querySelectorAll('.skill-category').forEach(cat => {
    gsap.from(cat.querySelectorAll('.skill-tag'), {
      scale: 0, opacity: 0,
      stagger: 0.04, duration: 0.4,
      ease: 'back.out(2)',
      scrollTrigger: { trigger: cat, start: 'top 75%' }
    });
  });
}

/* ============ TIMELINE ANIMATIONS ============ */
function initTimelineAnimations() {
  gsap.from('#timeline-header', {
    y: 50, opacity: 0, duration: 0.8,
    scrollTrigger: { trigger: '#timeline', start: 'top 80%' }
  });

  // Animate the line growing
  gsap.from('.timeline-line', {
    scaleY: 0, transformOrigin: 'top center',
    duration: 1.5, ease: 'power2.out',
    scrollTrigger: { trigger: '.timeline', start: 'top 80%' }
  });

  // Each timeline item slides in from its side
  document.querySelectorAll('.timeline-item').forEach((item, i) => {
    const side = item.dataset.side;
    const xFrom = side === 'left' ? -80 : 80;

    gsap.from(item, {
      x: xFrom, opacity: 0, duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: item,
        start: 'top 82%',
      }
    });

    // Dot pulse
    gsap.from(item.querySelector('.timeline-dot'), {
      scale: 0, duration: 0.5,
      delay: 0.2,
      ease: 'back.out(3)',
      scrollTrigger: { trigger: item, start: 'top 82%' }
    });
  });
}

/* ============ LIGHT MODE ACCENT COLORS ============ */
const lightAccents = {
  all: '#38bdf8',
  customer: '#a855f7',
  'end-to-end': '#3b82f6',
  ml: '#0891b2',
  ai: '#059669',
  database: '#2563eb',
  ab: '#db2777',
  viz: '#0d9488',
  impact: '#d97706'
};

/* ============ PROJECT IMAGES MAPPING ============ */
const projectImages = {
  rfm_segmentation: [
    { src: '/projects/Customer Behavior Analysis/RFM SEGMETATION/SEGMENTATION OVERVIEW.png', caption: 'RFM Customer Segmentation Distribution Overview' },
    { src: '/projects/Customer Behavior Analysis/RFM SEGMETATION/ANALYSIS OVERVIEW 1.png', caption: 'RFM Segmentation Analysis Overview 1' },
    { src: '/projects/Customer Behavior Analysis/RFM SEGMETATION/ANALYSIS OVERVIEW 2.png', caption: 'RFM Segmentation Analysis Overview 2' },
    { src: '/projects/Customer Behavior Analysis/RFM SEGMETATION/ANALYSIS OVERVIEW 3.png', caption: 'RFM Segmentation Analysis Overview 3' },
    { src: '/projects/Customer Behavior Analysis/RFM SEGMETATION/ANALYSIS OVERVIEW 4.png', caption: 'RFM Segmentation Analysis Overview 4' }
  ],
  funnel_analysis: [
    { src: '/projects/Customer Behavior Analysis/Funnel analysis/UI IMPROVEMENT OVERVEW.png', caption: 'UI/UX Improvement Recommendations' },
    { src: '/projects/Customer Behavior Analysis/Funnel analysis/AANALYSIS OVERVEIW 1_FUNNELOVERVIEW.png', caption: 'Application Conversion Funnel Analysis' },
    { src: '/projects/Customer Behavior Analysis/Funnel analysis/ANALYSIS OVERVIEW_FUNNEL OVERVIEW.png', caption: 'User Flow and Funnel Breakdown' },
    { src: '/projects/Customer Behavior Analysis/Funnel analysis/ANALYSIS OVERVIEW_FUNNEL OVERVIEW 2.png', caption: 'Conversion and Exit Rates Analysis 2' },
    { src: '/projects/Customer Behavior Analysis/Funnel analysis/ANALYSIS OVERVIEW_FUNNEL OVERVIEW 3.png', caption: 'Conversion and Exit Rates Analysis 3' },
    { src: '/projects/Customer Behavior Analysis/Funnel analysis/ANALYSIS OVERVIEW_FUNNEL OVERVIEW 4.png', caption: 'Conversion and Exit Rates Analysis 4' }
  ],
  market_basket: [
    { src: '/projects/Customer Behavior Analysis/Market basket analysis/glimpse of analysis overview 1.png', caption: 'Apriori Analysis Association Rules Overview 1' },
    { src: '/projects/Customer Behavior Analysis/Market basket analysis/glimpse of analysis overview 2.png', caption: 'Apriori Analysis Association Rules Overview 2' },
    { src: '/projects/Customer Behavior Analysis/Market basket analysis/glimpse of python script 1.png', caption: 'Python script executing Apriori algorithm 1' },
    { src: '/projects/Customer Behavior Analysis/Market basket analysis/glimpse of python script 2.png', caption: 'Python script executing Apriori algorithm 2' }
  ],
  nyc_accident: [
    { src: '/projects/END to end analysis/traffic/dashboard.png', caption: 'NYC Traffic Accident Interactive Tableau Dashboard' },
    { src: '/projects/END to end analysis/traffic/analysis overview 1.png', caption: 'Accident Analysis Overview 1' },
    { src: '/projects/END to end analysis/traffic/analysis overview 2.png', caption: 'Accident Analysis Overview 2' },
    { src: '/projects/END to end analysis/traffic/analysis overview 3.png', caption: 'Accident Analysis Overview 3' },
    { src: '/projects/END to end analysis/traffic/analysis overview 4.png', caption: 'Accident Analysis Overview 4' },
    { src: '/projects/END to end analysis/traffic/analysis overview 5.png', caption: 'Accident Analysis Overview 5' },
    { src: '/projects/END to end analysis/traffic/analysis overview 6.png', caption: 'Accident Analysis Overview 6' },
    { src: '/projects/END to end analysis/traffic/analysis overview 7.png', caption: 'Accident Analysis Overview 7' },
    { src: '/projects/END to end analysis/traffic/analysis overview 8.png', caption: 'Accident Analysis Overview 8' },
    { src: '/projects/END to end analysis/traffic/analysis overview 9.png', caption: 'Accident Analysis Overview 9' },
    { src: '/projects/END to end analysis/traffic/TEAM GROUP N.png', caption: 'Project Team Group' }
  ],
  kemensos_bansos: [
    { src: '/projects/impac projects/bansos/province level tableau.png', caption: 'Province Level Social Aid Distribution Map in Tableau' },
    { src: '/projects/impac projects/bansos/district level looker.png', caption: 'District Level Daily Operational Tracker in Looker Studio' },
    { src: '/projects/impac projects/bansos/data cleaning ang mainpulation with python.png', caption: 'Python Pandas Data Cleaning Script' },
    { src: '/projects/impac projects/bansos/Data cleaning and manipulation with spreadsheet.png', caption: 'Spreadsheet Preprocessing' },
    { src: '/projects/impac projects/bansos/gambar kabpuaten sukoharjo.jpg', caption: 'Sukoharjo Regency Administrative Area Map' },
    { src: '/projects/impac projects/bansos/foto mas deri afianto.png', caption: 'Collaborative session with Sukoharjo Social Affairs Official Deri Afianto' }
  ],
  lpdp_pk239: [
    { src: '/projects/impac projects/pk 239/sipatuo sipatokong logo pk 239.png', caption: 'LPDP PK 239 Logo & Identity' },
    { src: '/projects/impac projects/pk 239/ERD and database.png', caption: 'Star Schema Relational ERD Database Design' },
    { src: '/projects/impac projects/pk 239/Table and functions usage 1.png', caption: 'Google Sheets Automated Query Tables 1' },
    { src: '/projects/impac projects/pk 239/Table and functions usage 2.png', caption: 'Google Sheets Automated Query Tables 2' },
    { src: '/projects/impac projects/pk 239/database team ( aku yang pojok kiri duduk) klo bisa ga usah di tampilin as main image cuman optional page aja atua gimana.png', caption: 'LPDP PK 239 Database Management Team' }
  ],
  sql_academy: [
    { src: '/projects/impac projects/SQL ACADEMY/ppi uk.png', caption: 'PPI UK Education Initiative SQL Academy' },
    { src: '/projects/impac projects/SQL ACADEMY/SQL ACADEMY PROGRAM TEAM.png', caption: 'SQL Academy Instructor and Developer Team' },
    { src: '/projects/impac projects/SQL ACADEMY/teaching.png', caption: 'Interactive Teaching Session' },
    { src: '/projects/impac projects/SQL ACADEMY/erd database.png', caption: 'Retail-Based Learning Database ERD Schema' },
    { src: '/projects/impac projects/SQL ACADEMY/bigquery highlight.png', caption: 'Google BigQuery Live Demonstration' }
  ]
};

/* ============ PROJECT CARDS ============ */
function initProjectCards() {
  // Create a single unified timeline for the projects section to prevent trigger race conditions & height shifts
  const projectsTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: '#projects',
      start: 'top 80%',
      once: true // Run once and keep the final state
    }
  });

  // 1. Fade in projects header
  projectsTimeline.from('#projects-header', {
    y: 50,
    opacity: 0,
    duration: 0.8,
    ease: 'power2.out',
    immediateRender: false
  });

  // 2. Stagger category cards in (overlapping slightly with header)
  projectsTimeline.from('.category-card', {
    y: 30,
    opacity: 0,
    duration: 0.5,
    stagger: 0.05,
    ease: 'power2.out',
    immediateRender: false
  }, '-=0.4');

  // 3. Fade in the projects carousel wrapper (overlapping slightly with categories)
  projectsTimeline.from('.projects-carousel-wrapper', {
    y: 50,
    opacity: 0,
    duration: 0.8,
    ease: 'power2.out',
    immediateRender: false
  }, '-=0.3');

  // ─── CAROUSEL & PAGINATION STATE ───
  const carousel = document.getElementById('projects-carousel-container');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const categoryCards = document.querySelectorAll('.category-card');
  const projectCards = document.querySelectorAll('.project-card');
  const pageIndicator = document.getElementById('projects-page-indicator');

  let activeCategory = 'all';
  let currentPage = 1;
  let projectsPerPage = 9;

  function updateProjectsPerPage() {
    if (window.innerWidth <= 600) {
      projectsPerPage = 3;
    } else if (window.innerWidth <= 950) {
      projectsPerPage = 6;
    } else {
      projectsPerPage = 9;
    }
  }

  // Update on resize
  window.addEventListener('resize', () => {
    const oldPerPage = projectsPerPage;
    updateProjectsPerPage();
    if (oldPerPage !== projectsPerPage) {
      currentPage = 1;
      renderFilteredProjects(false);
    }
  });

  // Call initially
  updateProjectsPerPage();

  // ─── PAGINATED RENDER ENGINE ───
  function renderFilteredProjects(animate = true) {
    if (!carousel) return;

    const performUpdate = () => {
      const filtered = Array.from(projectCards).filter(project => {
        const categories = project.getAttribute('data-categories').split(' ');
        return activeCategory === 'all' || categories.includes(activeCategory);
      });

      if (activeCategory === 'all') {
        carousel.classList.add('grid-layout');
        carousel.parentElement.classList.add('grid-active');
      } else {
        carousel.classList.remove('grid-layout');
        carousel.parentElement.classList.remove('grid-active');
      }

      if (activeCategory === 'all') {
        const totalPages = Math.ceil(filtered.length / projectsPerPage);
        if (currentPage > totalPages) currentPage = totalPages;
        if (currentPage < 1) currentPage = 1;

        const startIndex = (currentPage - 1) * projectsPerPage;
        const endIndex = currentPage * projectsPerPage;
        const visible = filtered.slice(startIndex, endIndex);

        projectCards.forEach(project => {
          const isVisible = visible.includes(project);
          if (isVisible) {
            project.style.display = 'flex';
            project.style.opacity = '1';
            project.style.transform = 'scale(1)';
          } else {
            project.style.display = 'none';
            project.style.opacity = '0';
            project.style.transform = 'scale(0.95)';
          }
        });

        if (pageIndicator) {
          pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
        }
        updateArrowStatesGrid(currentPage, totalPages);
      } else {
        projectCards.forEach(project => {
          const isMatch = filtered.includes(project);
          if (isMatch) {
            project.style.display = 'flex';
            project.style.opacity = '1';
            project.style.transform = 'scale(1)';
          } else {
            project.style.display = 'none';
            project.style.opacity = '0';
            project.style.transform = 'scale(0.95)';
          }
        });

        carousel.scrollLeft = 0;
        updateArrowStatesCarousel();
      }
    };

    if (animate) {
      gsap.to(carousel, {
        opacity: 0,
        duration: 0.15,
        onComplete: () => {
          performUpdate();
          gsap.to(carousel, {
            opacity: 1,
            duration: 0.3,
            ease: 'power2.out'
          });
        }
      });
    } else {
      performUpdate();
      carousel.style.opacity = '1';
    }
  }

  function updateArrowStatesGrid(page, total) {
    if (page <= 1) {
      if (prevBtn) prevBtn.classList.add('disabled');
    } else {
      if (prevBtn) prevBtn.classList.remove('disabled');
    }

    if (page >= total) {
      if (nextBtn) nextBtn.classList.add('disabled');
    } else {
      if (nextBtn) nextBtn.classList.remove('disabled');
    }
  }

  function updateArrowStatesCarousel() {
    if (!carousel) return;
    const scrollLeft = carousel.scrollLeft;
    const maxScrollLeft = carousel.scrollWidth - carousel.clientWidth;

    if (maxScrollLeft <= 5) {
      if (prevBtn) prevBtn.classList.add('disabled');
      if (nextBtn) nextBtn.classList.add('disabled');
      return;
    }

    if (scrollLeft <= 5) {
      if (prevBtn) prevBtn.classList.add('disabled');
    } else {
      if (prevBtn) prevBtn.classList.remove('disabled');
    }

    if (scrollLeft >= maxScrollLeft - 5) {
      if (nextBtn) nextBtn.classList.add('disabled');
    } else {
      if (nextBtn) nextBtn.classList.remove('disabled');
    }
  }

  // ─── CAROUSEL BUTTONS CLICK EVENTS ───
  if (carousel && prevBtn && nextBtn) {
    const scrollAmount = 374; // 350px card width + 24px gap

    nextBtn.addEventListener('click', () => {
      if (activeCategory === 'all') {
        const filtered = Array.from(projectCards);
        const totalPages = Math.ceil(filtered.length / projectsPerPage);
        if (currentPage < totalPages) {
          currentPage++;
          renderFilteredProjects(true);
        }
      } else {
        carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    });

    prevBtn.addEventListener('click', () => {
      if (activeCategory === 'all') {
        if (currentPage > 1) {
          currentPage--;
          renderFilteredProjects(true);
        }
      } else {
        carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      }
    });

    carousel.addEventListener('scroll', () => {
      if (activeCategory === 'all') return;
      updateArrowStatesCarousel();
    });

    // Touch Swipe/Drag Scrolling Support (disabled in grid layout mode)
    let isDown = false;
    let startX;
    let scrollLeftVal;

    carousel.addEventListener('mousedown', (e) => {
      if (activeCategory === 'all') return;
      if (e.target.closest('a') || e.target.closest('button')) return;
      isDown = true;
      startX = e.pageX - carousel.offsetLeft;
      scrollLeftVal = carousel.scrollLeft;
    });

    carousel.addEventListener('mouseleave', () => {
      isDown = false;
    });

    carousel.addEventListener('mouseup', () => {
      isDown = false;
    });

    carousel.addEventListener('mousemove', (e) => {
      if (!isDown || activeCategory === 'all') return;
      e.preventDefault();
      const x = e.pageX - carousel.offsetLeft;
      const walk = (x - startX) * 1.5;
      carousel.scrollLeft = scrollLeftVal - walk;
    });
  }

  // ─── 3D TILT ON HOVER ───
  projectCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      gsap.to(card, {
        rotationY: x * 15,
        rotationX: -y * 15,
        transformPerspective: 800,
        ease: 'power2.out',
        duration: 0.4,
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotationY: 0, rotationX: 0,
        duration: 0.6,
        ease: 'elastic.out(1, 0.5)',
      });
    });

    // ─── CLICK TO OPEN DETAILS DRAWER ───
    card.addEventListener('click', (e) => {
      if (e.target.closest('a') || e.target.closest('button')) return;

      const projectId = card.getAttribute('data-id');
      const proj = projectsData[projectId];
      if (!proj) return;

      openProjectDetails(projectId, proj);
    });
  });

  // ─── DETAILS PANEL DRAWER CLOSE TRIGGERS ───
  const overlay = document.getElementById('details-drawer-overlay');
  const panel = document.getElementById('details-drawer-panel');
  const closeBtn = document.getElementById('drawer-close-btn');

  if (overlay && panel && closeBtn) {
    closeBtn.addEventListener('click', closeProjectDetails);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeProjectDetails();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('active')) {
        closeProjectDetails();
      }
    });
  }

  // ─── CATEGORY FILTER HUB TRIGGERS ───
  categoryCards.forEach(card => {
    card.addEventListener('click', () => {
      // Update active category
      categoryCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      activeCategory = card.getAttribute('data-filter');
      currentPage = 1; // Reset to page 1
      renderFilteredProjects(true);
    });
  });

  // ─── INITIAL RENDER ───
  renderFilteredProjects(false);
}

/* ============ OPEN DETAILS DRAWER DETAILS ============ */
function openProjectDetails(id, proj) {
  const overlay = document.getElementById('details-drawer-overlay');
  const panel = document.getElementById('details-drawer-panel');
  const content = document.getElementById('drawer-content-body');

  if (!overlay || !panel || !content) return;

  // Map long category names to short keys used in Lotties and light mode accents
  const categoryShortKeys = {
    'customer behaviour': 'customer',
    'customer behavior': 'customer',
    'customer behavior analysis': 'customer',
    'customer behaviour analysis': 'customer',
    'end-to-end': 'end-to-end',
    'end-to-end analysis': 'end-to-end',
    'machine learning': 'ml',
    'applied ai': 'ai',
    'applied ai & intelligent systems': 'ai',
    'database building': 'database',
    'a/b testing': 'ab',
    'data visualization': 'viz',
    'impact projects': 'impact'
  };
  const filterKey = proj.category.toLowerCase().replace(/\s+/g, '-');
  const categoryKey = categoryShortKeys[proj.category.toLowerCase().trim()] || filterKey;
  const accentColor = lightAccents[categoryKey] || '#111827';
  panel.style.setProperty('--accent-color-light', accentColor);

  let html = '';
  const images = projectImages[id] || [];

  // Generate media HTML for image slideshow
  let mediaHtml = '';
  if (images.length > 0) {
    mediaHtml = `
      <div class="drawer-slideshow">
        ${images.map((img, idx) => `
          <img src="${img.src}" class="${idx === 0 ? 'active' : ''}" alt="${img.caption || ''}" data-idx="${idx}" />
        `).join('')}
        ${images.length > 1 ? `
          <button class="drawer-slideshow-prev" id="drawer-slide-prev">◀</button>
          <button class="drawer-slideshow-next" id="drawer-slide-next">▶</button>
        ` : ''}
        <div class="drawer-slideshow-caption" id="drawer-slide-caption">
          ${images[0].caption || ''}
        </div>
      </div>
    `;
  } else {
    mediaHtml = `
      <div class="detail-image-box">
        <div class="detail-image-icon">📊</div>
        <strong>Dashboard Screenshot & Layout Details</strong>
        <span>[Visualization file to be connected in final production]</span>
      </div>
    `;
  }

  // Tool logos mapping
  const toolLogos = {
    'python': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg',
    'pandas': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/pandas/pandas-original.svg',
    'tableau': 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/tableau.svg',
    'tableau prep': 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/tableau.svg',
    'looker studio': 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/looker.svg',
    'excel': 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/microsoftexcel.svg',
    'adv. excel': 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/microsoftexcel.svg',
    'google sheets': 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/googlesheets.svg',
    'postgresql': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg',
    'supabase': 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/supabase.svg',
    'streamlit': 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/streamlit.svg',
    'plotly': 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/plotly.svg',
    'llama 3': 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/meta.svg',
    'r': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/r/r-original.svg',
    'rstudio': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/rstudio/rstudio-original.svg',
    'figma': 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/figma.svg',
    'adobe illustrator': 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/adobeillustrator.svg',
    'power bi': 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/powerbi.svg',
    'numpy': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/numpy/numpy-original.svg',
    'scikit-learn': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/scikitlearn/scikitlearn-original.svg',
    'machine learning': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/scikitlearn/scikitlearn-original.svg',
    'bigquery (sql)': 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/googlecloud.svg',
    'bigquery': 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/googlecloud.svg',
    'sql query functions': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg',
    'ab testing': 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/testinglibrary.svg',
    'sqlite': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/sqlite/sqlite-original.svg'
  };

  const toolsHtml = proj.tools ? proj.tools.map(tool => {
    const cleanKey = tool.toLowerCase().trim();
    const logoUrl = toolLogos[cleanKey];
    if (logoUrl) {
      return `
        <span class="detail-tool-badge">
          <img src="${logoUrl}" alt="${tool}" class="tool-logo-img" />
          <span>${tool}</span>
        </span>
      `;
    }
    return `<span class="detail-tool-badge">${tool}</span>`;
  }).join('') : '';

  // Metadata Grid Adjustment (OMIT ROLE, ADD LOCATION)
  let metaGridHtml = '';
  if (proj.client) {
    metaGridHtml += `<div class="detail-meta-item"><strong>Client / Context</strong><span>${proj.client}</span></div>`;
  }
  if (proj.timeline) {
    metaGridHtml += `<div class="detail-meta-item"><strong>Timeline</strong><span>${proj.timeline}</span></div>`;
  }
  if (proj.location) {
    metaGridHtml += `<div class="detail-meta-item"><strong>Location</strong><span>${proj.location}</span></div>`;
  }
  if (proj.role) {
    metaGridHtml += `<div class="detail-meta-item"><strong>Role</strong><span>${proj.role}</span></div>`;
  }

  // Header template with Lottie wrapper
  const headerHtml = `
    <div class="detail-header">
      <span class="detail-category-badge" style="background-color: ${accentColor}">${proj.category}</span>
      <div class="detail-title-wrapper">
        <div id="drawer-title-lottie" class="drawer-title-lottie-container"></div>
        <h2 class="detail-title" style="margin-bottom: 0;">${proj.title}</h2>
      </div>
      <div class="detail-meta-grid">
        ${metaGridHtml}
      </div>
    </div>
  `;

  // Choose structure
  if (proj.structure === 3) {
    // STRUCTURE 3: Technical/Others
    html = `
      ${headerHtml}

      <div class="detail-section-card">
        <h3 class="detail-section-title">Case Overview</h3>
        <div class="detail-desc-text"><p>${proj.caseOverview}</p></div>
      </div>

      <div class="detail-section-card">
        <h3 class="detail-section-title">Scope & Goals</h3>
        <div class="detail-desc-text"><p>${proj.scopeGoals}</p></div>
      </div>

      <div class="detail-section-card">
        <h3 class="detail-section-title">Summary</h3>
        <div class="detail-desc-text"><p>${proj.summary}</p></div>
      </div>

      <div class="detail-section-card">
        <h3 class="detail-section-title">Tools & Technologies</h3>
        <div class="detail-tools-container">
          ${toolsHtml}
        </div>
      </div>

      <div class="detail-section-card">
        <h3 class="detail-section-title">Methodology</h3>
        <div class="detail-methodology-timeline">
          ${proj.methodology ? proj.methodology.map(step => `
            <div class="detail-method-step">
              <div class="detail-method-step-title">${step.title}</div>
              <div class="detail-method-step-desc">${step.desc}</div>
            </div>
          `).join('') : ''}
        </div>
      </div>

      ${images.length > 0 ? `
        <div class="detail-section-card">
          <h3 class="detail-section-title">Analysis & Visual Overview</h3>
          ${mediaHtml}
        </div>
      ` : ''}

      <div class="detail-action-links">
        ${proj.githubLink ? `<a href="${proj.githubLink}" target="_blank" class="detail-btn-action detail-btn-action-primary">View GitHub Repo</a>` : ''}
        ${proj.liveLink ? `<a href="${proj.liveLink}" target="_blank" class="detail-btn-action detail-btn-action-secondary">Live Demo / Deck</a>` : ''}
      </div>
    `;
  } else if (proj.structure === 2) {
    // STRUCTURE 2: Data Visualization
    html = `
      ${headerHtml}

      <div class="detail-section-card">
        <h3 class="detail-section-title">Project Description</h3>
        <div class="detail-desc-text"><p>${proj.description}</p></div>
      </div>

      <div class="detail-section-card">
        <h3 class="detail-section-title">Tools & BI Suite</h3>
        <div class="detail-tools-container">
          ${toolsHtml}
        </div>
      </div>

      ${images.length > 0 ? `
        <div class="detail-section-card">
          <h3 class="detail-section-title">Dashboard Overview</h3>
          ${mediaHtml}
        </div>
      ` : ''}

      <div class="detail-section-card">
        <h3 class="detail-section-title">Dashboard Pages & Purpose</h3>
        <div style="margin-top: 1rem;">
          ${proj.pages ? proj.pages.map((page, idx) => `
            <div class="detail-viz-page-box">
              <span class="detail-viz-page-num">PAGE 0${idx + 1}</span>
              <div class="detail-viz-page-name">${page.name}</div>
              <div class="detail-viz-page-purpose">${page.purpose}</div>
            </div>
          `).join('') : ''}
        </div>
      </div>

      <div class="detail-action-links">
        ${proj.liveLink ? `<a href="${proj.liveLink}" target="_blank" class="detail-btn-action detail-btn-action-primary">Open Interactive Dashboard</a>` : ''}
      </div>
    `;
  } else if (proj.structure === 1) {
    // STRUCTURE 1: Impact Projects
    
    // Check for map scope image
    let overviewImgHtml = '';
    if (proj.cardBgImage) {
      overviewImgHtml = `
        <div style="margin-top: 1.5rem; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02); max-width: 500px; cursor: zoom-in;">
          <img src="${proj.cardBgImage}" alt="Regency Scope Map" style="width: 100%; height: auto; display: block;" class="zoomable-scope-map" />
          <div style="padding: 0.75rem 1rem; font-size: 0.8rem; color: #6b7280; background: #fafafa; text-align: center; border-top: 1px solid #e2e8f0; font-weight: 500;">
            Project Geographic Scope: Sukoharjo Regency, Central Java
          </div>
        </div>
      `;
    }

    // Check for testimonial split avatar layout
    let testimonialHtml = '';
    if (proj.testimonial) {
      testimonialHtml = `
        <div class="detail-testimonial-wrapper">
          <img src="${proj.testimonial.photo}" alt="${proj.testimonial.author}" class="testimonial-avatar" />
          <div class="testimonial-content">
            <div class="testimonial-quote">${proj.testimonial.quote}</div>
            <div class="testimonial-author-info">
              <span class="testimonial-author">${proj.testimonial.author}</span>
              <span class="testimonial-role">${proj.testimonial.role}</span>
            </div>
          </div>
        </div>
      `;
    } else if (proj.quoteText) {
      testimonialHtml = `
        <div class="detail-testimonial-box">
          <p>${proj.quoteText}</p>
        </div>
      `;
    }

    // Check for separated overview blocks
    let overviewsBlockHtml = '';
    if (proj.analysisOverview && proj.dashboardOverview) {
      overviewsBlockHtml = `
        <div class="detail-section-card">
          <h3 class="detail-section-title">${proj.analysisOverview.title}</h3>
          <p class="detail-overview-desc">${proj.analysisOverview.desc}</p>
          <div class="detail-overview-grid">
            ${proj.analysisOverview.images.map(img => `
              <div class="detail-overview-card clickable-overview-img">
                <div class="detail-overview-img-wrapper">
                  <img src="${img.src}" alt="${img.caption}" />
                </div>
                <div class="detail-overview-caption">${img.caption}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="detail-section-card">
          <h3 class="detail-section-title">${proj.dashboardOverview.title}</h3>
          <p class="detail-overview-desc">${proj.dashboardOverview.desc}</p>
          <div class="detail-overview-grid">
            ${proj.dashboardOverview.images.map(img => `
              <div class="detail-overview-card clickable-overview-img">
                <div class="detail-overview-img-wrapper">
                  <img src="${img.src}" alt="${img.caption}" />
                </div>
                <div class="detail-overview-caption">${img.caption}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else {
      overviewsBlockHtml = `
        <div class="detail-section-card">
          <h3 class="detail-section-title">Visual Overview</h3>
          ${mediaHtml}
        </div>
      `;
    }

    html = `
      ${headerHtml}

      <div class="detail-section-card">
        <h3 class="detail-section-title">Project Overview</h3>
        <div class="detail-desc-text">
          <p>${proj.overviewText}</p>
          ${overviewImgHtml}
        </div>
      </div>

      <div class="detail-section-card">
        <h3 class="detail-section-title">Key Impact & Outcomes</h3>
        <div class="detail-desc-text"><p>${proj.impactText}</p></div>
      </div>

      ${testimonialHtml ? `
        <div class="detail-section-card">
          <h3 class="detail-section-title">Client Testimonial</h3>
          ${testimonialHtml}
        </div>
      ` : ''}

      <div class="detail-section-card">
        <h3 class="detail-section-title">Tools & Databases</h3>
        <div class="detail-tools-container">
          ${toolsHtml}
        </div>
      </div>

      ${overviewsBlockHtml}

      <div class="detail-action-links">
        ${proj.links ? proj.links.map(link => `
          <a href="${link.url}" target="_blank" class="detail-btn-action detail-btn-action-primary">${link.label}</a>
        `).join('') : ''}
      </div>
    `;
  }

  content.innerHTML = html;

  // Destroy previous dynamic drawer title lottie if running
  if (window.drawerTitleLottieAnim) {
    window.drawerTitleLottieAnim.destroy();
    window.drawerTitleLottieAnim = null;
  }

  // Load new Lottie category icon dynamically inside drawer header
  const categoryLottiePaths = {
    all: '/foto/expereince/icon project archives.json',
    customer: '/projects/Customer Behavior Analysis/customer behaviour analysis.json',
    'end-to-end': '/projects/END to end analysis/end to end analysis.json',
    ml: '/projects/machine learning/machine learning.json',
    ai: '/projects/Applied AI & Intelligent Systems/APPLIED AI AND INTELLIGENT.json',
    database: '/projects/Database Building/databasebuilding.json',
    ab: '/projects/AB Testing/ab testing.json',
    viz: '/projects/Data Visualization/dataviz.json',
    impact: '/projects/impac projects/impact.json'
  };

  const lottieContainer = document.getElementById('drawer-title-lottie');
  const lottiePath = categoryLottiePaths[filterKey];
  if (lottieContainer && lottiePath && typeof lottie !== 'undefined') {
    fetch(lottiePath)
      .then(res => {
        if (!res.ok) throw new Error('Network error loading lottie');
        return res.json();
      })
      .then(data => {
        try {
          const clonedLottie = JSON.parse(JSON.stringify(data));
          if (typeof makeLottieColorsBright === 'function') {
            makeLottieColorsBright(clonedLottie);
          }
          window.drawerTitleLottieAnim = lottie.loadAnimation({
            container: lottieContainer,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            animationData: clonedLottie
          });
        } catch (lottieErr) {
          console.error('Lottie render error inside drawer:', lottieErr);
        }
      })
      .catch(fetchErr => console.error('Error fetching dynamic drawer lottie:', fetchErr));
  }

  // Bind slideshow events inside the drawer if there are multiple images
  if (images.length > 1 && !proj.analysisOverview) {
    let activeIdx = 0;
    const slideImgs = panel.querySelectorAll('.drawer-slideshow img');
    const prevBtn = panel.querySelector('#drawer-slide-prev');
    const nextBtn = panel.querySelector('#drawer-slide-next');
    const captionEl = panel.querySelector('#drawer-slide-caption');

    const updateSlides = (newIdx) => {
      slideImgs[activeIdx].classList.remove('active');
      slideImgs[newIdx].classList.add('active');
      activeIdx = newIdx;
      if (captionEl && images[activeIdx]) {
        captionEl.textContent = images[activeIdx].caption || '';
      }
    };

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const newIdx = (activeIdx - 1 + images.length) % images.length;
        updateSlides(newIdx);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const newIdx = (activeIdx + 1) % images.length;
        updateSlides(newIdx);
      });
    }

    // Zoom lightbox for drawer images on click
    slideImgs.forEach((img) => {
      img.addEventListener('click', (e) => {
        e.stopPropagation();
        const lightbox = document.getElementById('hologram-lightbox');
        const lbImg = document.getElementById('lightbox-img');
        const lbCaption = document.getElementById('lightbox-caption');
        if (lightbox && lbImg) {
          lbImg.src = img.src;
          if (lbCaption) lbCaption.textContent = img.alt || '';
          lightbox.classList.add('active');
        }
      });
    });
  } else if (images.length === 1 && !proj.analysisOverview) {
    const singleImg = panel.querySelector('.drawer-slideshow img');
    if (singleImg) {
      singleImg.addEventListener('click', (e) => {
        e.stopPropagation();
        const lightbox = document.getElementById('hologram-lightbox');
        const lbImg = document.getElementById('lightbox-img');
        const lbCaption = document.getElementById('lightbox-caption');
        if (lightbox && lbImg) {
          lbImg.src = singleImg.src;
          if (lbCaption) lbCaption.textContent = singleImg.alt || '';
          lightbox.classList.add('active');
        }
      });
    }
  }

  // Bind zoom lightbox click events for custom overview grids and map if present
  const overviewCards = panel.querySelectorAll('.clickable-overview-img');
  overviewCards.forEach((card) => {
    card.addEventListener('click', (e) => {
      e.stopPropagation();
      const img = card.querySelector('img');
      const lightbox = document.getElementById('hologram-lightbox');
      const lbImg = document.getElementById('lightbox-img');
      const lbCaption = document.getElementById('lightbox-caption');
      if (lightbox && lbImg && img) {
        lbImg.src = img.src;
        if (lbCaption) lbCaption.textContent = img.alt || '';
        lightbox.classList.add('active');
      }
    });
  });

  const scopeMap = panel.querySelector('.zoomable-scope-map');
  if (scopeMap) {
    scopeMap.addEventListener('click', (e) => {
      e.stopPropagation();
      const lightbox = document.getElementById('hologram-lightbox');
      const lbImg = document.getElementById('lightbox-img');
      const lbCaption = document.getElementById('lightbox-caption');
      if (lightbox && lbImg) {
        lbImg.src = scopeMap.src;
        if (lbCaption) lbCaption.textContent = 'Project Geographic Scope: Sukoharjo Regency, Central Java';
        lightbox.classList.add('active');
      }
    });
  }

  // Suspend heavy Three.js animation rendering loop
  pauseThreeBackground();

  // Slide-in animation using GSAP
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';

  gsap.set(panel, { xPercent: 100 });
  gsap.to(overlay, { opacity: 1, duration: 0.3 });
  gsap.to(panel, { 
    xPercent: 0, 
    duration: 0.5, 
    ease: 'power3.out',
    onComplete: () => {
      // Clear transform to prevent browser sub-pixel rendering blur!
      gsap.set(panel, { clearProps: 'transform' });
    }
  });
}

/* ============ CLOSE DETAILS DRAWER ============ */
function closeProjectDetails() {
  const overlay = document.getElementById('details-drawer-overlay');
  const panel = document.getElementById('details-drawer-panel');

  if (!overlay || !panel) return;

  // Destroy dynamic title Lottie animation
  if (window.drawerTitleLottieAnim) {
    window.drawerTitleLottieAnim.destroy();
    window.drawerTitleLottieAnim = null;
  }

  // Restore transform state before animating close
  gsap.set(panel, { xPercent: 0 });

  gsap.to(panel, {
    xPercent: 100,
    duration: 0.4,
    ease: 'power3.in',
    onComplete: () => {
      gsap.to(overlay, {
        opacity: 0,
        duration: 0.2,
        onComplete: () => {
          overlay.classList.remove('active');
          document.body.style.overflow = '';
          // Resume background Three.js loop
          resumeThreeBackground();
          if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
          }
        }
      });
    }
  });
}

/* ============ CONTACT / TYPEWRITER ============ */
function initContactSection() {
  gsap.from('#contact-header', {
    y: 50, opacity: 0, duration: 0.8,
    scrollTrigger: { trigger: '#contact', start: 'top 80%' }
  });

  gsap.from('.terminal', {
    y: 40, opacity: 0, scale: 0.95, duration: 0.8,
    ease: 'back.out(1.5)',
    scrollTrigger: { trigger: '.terminal', start: 'top 80%' }
  });

  // Typewriter
  const email = 'fakhribudiman1721@gmail.com';
  const typewriterEl = document.getElementById('typewriter');
  let typed = false;

  ScrollTrigger.create({
    trigger: '#contact',
    start: 'top 65%',
    once: true,
    onEnter: () => {
      if (typed) return;
      typed = true;
      let i = 0;
      const interval = setInterval(() => {
        if (i <= email.length) {
          typewriterEl.textContent = email.substring(0, i);
          i++;
        } else {
          clearInterval(interval);
        }
      }, 60);
    }
  });

}

/* ============ SCI-FI TYPING QUOTE ============ */
function initScifiTypingQuote() {
  const quoteSec = document.getElementById('quote');
  const typingTextEl = document.getElementById('scifi-typing-text');
  const citeEl = document.getElementById('scifi-cite');
  const containerEl = document.querySelector('.scifi-quote-container');

  if (!quoteSec || !typingTextEl) return;

  // Use \u00A0 (non-breaking space) between WITHOUT and DATA so they wrap together perfectly
  const fullText = '"YOU CAN HAVE DATA WITHOUT INFORMATION, BUT YOU CANNOT HAVE INFORMATION WITHOUT\u00A0DATA."';
  let typed = false;

  ScrollTrigger.create({
    trigger: '#quote',
    start: 'top 65%',
    once: true,
    onEnter: () => {
      if (typed) return;
      typed = true;
      let i = 0;

      // Fast sci-fi typing
      const interval = setInterval(() => {
        if (i <= fullText.length) {
          typingTextEl.textContent = fullText.substring(0, i);
          i++;
        } else {
          clearInterval(interval);
          // When typing finishes, show cite and start float effect
          gsap.to(citeEl, { opacity: 1, y: -10, duration: 1, ease: 'power2.out' });
          containerEl.classList.add('float-effect');
        }
      }, 50); // 50ms per character
    }
  });
}

/* ============ MUSIC PLAYER & UI ============ */
function initMusicPlayer() {
  const musicToggle = document.getElementById('music-toggle');
  const bgMusic = document.getElementById('bg-music');
  const volumeSlider = document.getElementById('volume-slider');
  const musicToast = document.getElementById('music-toast');
  const closeToastBtn = document.getElementById('close-toast');

  if (!musicToggle || !bgMusic) return;

  // Set initial music volume based on slider
  bgMusic.volume = volumeSlider ? volumeSlider.value : 0.3;

  // Toggle play/pause
  musicToggle.addEventListener('click', () => {
    if (bgMusic.paused) {
      bgMusic.play();
      musicToggle.classList.add('playing');
      // Hide toast immediately if user plays music
      if (musicToast) musicToast.classList.remove('show');
    } else {
      bgMusic.pause();
      musicToggle.classList.remove('playing');
    }
  });

  // Handle volume change
  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      bgMusic.volume = e.target.value;
      // Automatically play if volume is increased from 0 and currently paused
      if (bgMusic.paused && e.target.value > 0) {
        bgMusic.play();
        musicToggle.classList.add('playing');
        if (musicToast) musicToast.classList.remove('show');
      }
    });
  }

  // Manual close button
  if (closeToastBtn) {
    closeToastBtn.addEventListener('click', () => {
      musicToast.classList.remove('show');
    });
  }
}

// Called after hero animation finishes
window.triggerMusicUI = function() {
  const musicContainer = document.getElementById('music-container');
  const bgMusic = document.getElementById('bg-music');
  const musicToast = document.getElementById('music-toast');

  if (musicContainer) {
    musicContainer.classList.add('show-ui');
  }

  // Toast Notification Logic (Pop up gently after 2 seconds)
  if (musicToast) {
    setTimeout(() => {
      // Only show if they haven't manually started the music already
      if (bgMusic && bgMusic.paused) {
        musicToast.classList.add('show');
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
          musicToast.classList.remove('show');
        }, 10000);
      }
    }, 2000);
  }
}

/* ============ MAGIC PORTALS (GSAP SCROLLTRIGGER + CANVAS PARTICLES) ============ */
function initMagicPortals() {
  const portals = document.querySelectorAll('.magic-portal');
  if (!portals.length) return;

  // We will load the 3D portal dynamically to keep initial load fast
  import('./portal3d.js').then(({ init3DPortal }) => {
    const portal3DInstances = [];
    
    portals.forEach((portal, index) => {
      // Create a container specifically for the 3D canvas so it sits behind the content
      const canvasContainer = document.createElement('div');
      canvasContainer.style.position = 'absolute';
      canvasContainer.style.top = '50%';
      canvasContainer.style.left = '50%';
      canvasContainer.style.transform = 'translate(-50%, -50%)';
      // Make it larger than the 280px portal div so the glow isn't cut off
      canvasContainer.style.width = '600px';
      canvasContainer.style.height = '600px';
      canvasContainer.style.zIndex = '-1'; // Behind everything
      canvasContainer.style.pointerEvents = 'none';
      
      // Add radial mask to seamlessly blend the black background of the 3D canvas into the website background
      canvasContainer.style.maskImage = 'radial-gradient(circle at center, black 30%, transparent 60%)';
      canvasContainer.style.webkitMaskImage = 'radial-gradient(circle at center, black 30%, transparent 60%)';
      
      // Make sure the portal content stays on top and is clickable
      const magicContent = portal.querySelector('.magic-content');
      if (magicContent) {
        magicContent.style.position = 'relative';
        magicContent.style.zIndex = '10';
        magicContent.style.pointerEvents = 'auto';
        gsap.set(magicContent, { opacity: 0, scale: 0.5 });
      }

      // Make sure hologram doesn't block clicks
      const hologram = portal.querySelector('.magic-hologram');
      if (hologram) {
        hologram.style.pointerEvents = 'none';
      }

      // Ensure the portal itself is clickable
      portal.style.overflow = 'visible';
      portal.style.cursor = 'pointer';
      
      portal.insertBefore(canvasContainer, portal.firstChild);

      // Initialize the 3D portal inside this container
      const portal3D = init3DPortal(canvasContainer);
      if (!portal3D) return;
      portal3DInstances.push(portal3D);

      // Use GSAP ScrollTrigger to start the 3D animation when scrolled into view
      ScrollTrigger.create({
        trigger: portal,
        start: "top 85%",
        once: true, // Only trigger the animation once!
        onEnter: () => {
          // Immediately set container to full scale so 3D portal dictates the expansion visually
          gsap.set(portal, { scale: 1, opacity: 1 });
          portal.classList.add('is-expanding');
          
          portal3D.start();
          
          // The content (text and icon) inside should fade in after the 3D portal has grown
          if (magicContent) {
            gsap.to(magicContent, {
              opacity: 1,
              scale: 1,
              duration: 1.0,
              delay: 1.8, // Wait for the 3D portal to mostly finish expanding
              ease: "back.out(1.5)",
              onComplete: () => {
                portal.classList.remove('is-expanding');
                portal.classList.add('is-visible');
              }
            });
          }
        }
      });
    });

    // Expose stop/start so warp transitions can pause GPU-heavy 3D portals
    window.stopAllPortals = () => portal3DInstances.forEach(p => p.stop());
    window.startAllPortals = () => portal3DInstances.forEach(p => p.start());

  }).catch(err => {
    console.error("Failed to load 3D portal:", err);
  });
}

/* ============ SPACE ROOM PARALLAX SCROLL (3D Z-AXIS) ============ */
function initSpaceRoomScroll() {
  const container = document.querySelector('.space-scroll-container');
  if (!container) return;

  // We will completely bypass browser scrollbars and use a pure JS scroll state
  // to ensure 100% cross-browser compatibility and completely hide any native scrollbars.
  let virtualScrollY = 0;
  container.style.overflow = 'hidden'; // Disable native scroll entirely

  // A function to re-calculate layout whenever modal is opened or resized
  window.updateSpaceRoom3D = () => {
    const items = document.querySelectorAll('.space-timeline .space-item');
    if(items.length === 0) return;

    // Reset our virtual scroll position
    virtualScrollY = 0; // Start at the beginning (Z=0)
    
    // Hide body scrollbar to prevent double scrollbars
    document.body.style.overflow = 'hidden';

    // Force an initial layout calculation!
    updateItemsZ();
  };

  // When closing the space room
  const closeSpaceBtn = document.getElementById('close-space');
  if (closeSpaceBtn) {
    closeSpaceBtn.addEventListener('click', () => {
      document.body.style.overflow = ''; // Restore body scroll
    });
  }

  // The render function that calculates 3D positions based on our virtual state
  function updateItemsZ() {
    const items = document.querySelectorAll('.space-timeline .space-item');
    if (items.length === 0) return;
    
    // Calculate infinite loop boundaries
    const itemSpacing = 3000;
    const totalDepth = items.length * itemSpacing;
    
    // The tunnel goes from Z=800 (front) to Z=-(totalDepth - 800) (back)
    const wrapZ = gsap.utils.wrap(-(totalDepth - 800), 800);
    
    items.forEach(item => {
      const baseZ = parseFloat(item.getAttribute('data-z')) || 0;
      
      // Calculate current Z position based on virtual scroll
      let currentZ = baseZ + (virtualScrollY * 1.5); 
      currentZ = wrapZ(currentZ);

      // Calculate opacity and scale based on Z depth
      let opacity = 0;
      
      if (currentZ > 800) {
        opacity = 0;
        item.style.pointerEvents = 'none';
      } else if (currentZ > 0) {
        opacity = 1 - (currentZ / 800);
        item.style.pointerEvents = 'none'; 
      } else if (currentZ > -3000) {
        opacity = 1;
        item.style.pointerEvents = 'auto';
      } else if (currentZ > -totalDepth) {
        // Fade out as it goes towards the back end of the tunnel
        const fadeStart = -3000;
        const fadeEnd = -totalDepth;
        opacity = 1 - ((Math.abs(currentZ) - Math.abs(fadeStart)) / (Math.abs(fadeEnd) - Math.abs(fadeStart)));
        item.style.pointerEvents = 'none';
      } else {
        opacity = 0;
        item.style.pointerEvents = 'none';
      }

      // Apply the 3D transform directly via GSAP
      gsap.set(item, {
        xPercent: -50,
        yPercent: -50,
        z: currentZ,
        opacity: opacity
      });

      // Add glow when item is right in front of the camera
      const card = item.querySelector('.space-card');
      if (card) {
        if (currentZ > -800 && currentZ < 200) {
          card.style.boxShadow = `0 10px 40px rgba(56,189,248,0.3), inset 0 0 20px rgba(56,189,248,0.1)`;
          card.style.borderColor = `rgba(56,189,248,0.6)`;
        } else {
          card.style.boxShadow = `0 10px 30px rgba(0,0,0,0.5), inset 0 0 20px rgba(56,189,248,0.05)`;
          card.style.borderColor = `rgba(56,189,248,0.2)`;
        }
      }
    });
  }

  // Intercept all wheel events and convert them to virtual scroll movement
  container.addEventListener('wheel', (e) => {
    if (e.target.closest('.m-desc-wrapper')) {
      return; // Allow natural scrolling inside the text card description
    }
    e.preventDefault(); // Stop native scrolling
    
    // Normalize wheel delta (differs between Windows/Mac and mouse/trackpad)
    const delta = e.deltaY;
    
    // Update our virtual position
    virtualScrollY += delta * 1.5; 
    
    // Re-render the 3D tunnel
    updateItemsZ();
  }, { passive: false });

  // Mobile Touch Support
  let touchStartY = 0;
  container.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  container.addEventListener('touchmove', (e) => {
    if (e.target.closest('.m-desc-wrapper')) {
      return; // Allow natural touch scrolling inside the text card description
    }
    e.preventDefault();
    const touchY = e.touches[0].clientY;
    const delta = touchStartY - touchY;
    virtualScrollY += delta * 4; // Touch multiplier for better feel
    touchStartY = touchY;
    updateItemsZ();
  }, { passive: false });
}

/* ============ SECTION HEADER ANIMATIONS (SCI-FI GLOW FADE) ============ */
function initHeaderAnimations() {
  const sectionHeaders = document.querySelectorAll('.section-header');
  const categoryHeaders = document.querySelectorAll('.category-header');

  // Animate main section headers (What I Bring, My Universe of Skills, etc.)
  sectionHeaders.forEach((header) => {
    const tag = header.querySelector('.section-tag');
    const title = header.querySelector('.section-title');
    const subtitle = header.querySelector('.section-subtitle');

    // Initial state
    gsap.set([tag, title, subtitle], { 
      opacity: 0, 
      y: 40,
      scale: 0.95,
      textShadow: "0 0 0px rgba(56,189,248, 0)" // No glow initially
    });

    ScrollTrigger.create({
      trigger: header,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        const tl = gsap.timeline();
        
        // Tag pops up
        if (tag) {
          tl.to(tag, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.5)" });
        }
        
        // Title glowing fade up
        if (title) {
          tl.to(title, { 
            opacity: 1, 
            y: 0, 
            scale: 1, 
            textShadow: "0 0 20px rgba(56,189,248, 0.8)", // Bright glow
            duration: 0.6, 
            ease: "power2.out" 
          }, "-=0.2")
          // Settle the glow down to normal
          .to(title, {
            textShadow: "0 0 10px rgba(56,189,248, 0.4)",
            duration: 0.8,
            ease: "power1.inOut"
          }, "-=0.2");
        }
        
        // Subtitle smooth fade
        if (subtitle) {
          tl.to(subtitle, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "power2.out" }, "-=0.6");
        }
      }
    });
  });

  // Animate sub-category headers (Data Analytics & BI, AI & ML, etc.)
  categoryHeaders.forEach((header, index) => {
    gsap.set(header, { opacity: 0, x: -30, textShadow: "0 0 0px rgba(56,189,248, 0)" });
    
    ScrollTrigger.create({
      trigger: header,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        gsap.to(header, {
          opacity: 1,
          x: 0,
          textShadow: "0 0 15px rgba(56,189,248, 0.6)",
          duration: 0.8,
          ease: "power2.out",
          delay: (index % 3) * 0.2 // Stagger slightly if side-by-side
        });
      }
    });
  });
}

/* ============ LOTTIE ANIMATIONS ============ */
function initLottieAnimations() {
  const eduContainer = document.getElementById('lottie-education');
  if (eduContainer && typeof lottie !== 'undefined') {
    lottie.loadAnimation({
      container: eduContainer,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: '/foto/education/icon_education.json'
    });
  }

  const expContainer = document.getElementById('lottie-experience');
  if (expContainer && typeof lottie !== 'undefined') {
    lottie.loadAnimation({
      container: expContainer,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: '/foto/expereince/icon experience.json'
    });
  }

  // Paths mapping for on-demand dynamic Lottie fetches (reduces JS bundle size)
  const categoryLottiePaths = {
    all: '/foto/expereince/icon project archives.json',
    customer: '/projects/Customer Behavior Analysis/customer behaviour analysis.json',
    'end-to-end': '/projects/END to end analysis/end to end analysis.json',
    ml: '/projects/machine learning/machine learning.json',
    ai: '/projects/Applied AI & Intelligent Systems/APPLIED AI AND INTELLIGENT.json',
    database: '/projects/Database Building/databasebuilding.json',
    ab: '/projects/AB Testing/ab testing.json',
    viz: '/projects/Data Visualization/dataviz.json',
    impact: '/projects/impac projects/impact.json'
  };

  const loadPromises = Object.keys(categoryLottiePaths).map(key => {
    const container = document.getElementById(`lottie-cat-${key}`);
    if (container && typeof lottie !== 'undefined') {
      return fetch(categoryLottiePaths[key])
        .then(res => {
          if (!res.ok) throw new Error(`Failed to fetch Lottie asset for key "${key}"`);
          return res.json();
        })
        .then(data => {
          try {
            // Deep clone to prevent mutating read-only objects
            const clonedLottie = JSON.parse(JSON.stringify(data));
            
            // Process colors safely with error boundary
            try {
              makeLottieColorsBright(clonedLottie);
            } catch (colorErr) {
              console.error(`Color processing error for key "${key}":`, colorErr);
            }

            const anim = lottie.loadAnimation({
              container: container,
              renderer: 'svg',
              loop: true,
              autoplay: true,
              animationData: clonedLottie
            });

            // Special handling for Customer Behaviour to keep the person visible and prevent entry/exit fading
            if (key === 'customer') {
              anim.addEventListener('DOMLoaded', () => {
                const totalFrames = anim.totalFrames;
                const startFrame = Math.floor(totalFrames * 0.15);
                const endFrame = Math.floor(totalFrames * 0.65);
                anim.playSegments([startFrame, endFrame], true);
              });
            }
          } catch (renderErr) {
            console.error(`Render error for key "${key}":`, renderErr);
          }
        })
        .catch(fetchErr => {
          console.error(`Fetch error for key "${key}":`, fetchErr);
        });
    }
    return Promise.resolve();
  });

  // Recalculate ScrollTrigger markers once all dynamic icon paths settle
  Promise.all(loadPromises).then(() => {
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  });
}

/**
 * Recursive function to replace dark colors in Lottie JSONs with bright white
 * to ensure high contrast against the dark background theme.
 */
function makeLottieColorsBright(obj) {
  if (!obj || typeof obj !== 'object') return;
  
  if (obj.c && obj.c.k) {
    const k = obj.c.k;
    if (Array.isArray(k) && typeof k[0] === 'number') {
      if (k[0] < 0.3 && k[1] < 0.3 && k[2] < 0.3) {
        k[0] = 1;
        k[1] = 1;
        k[2] = 1;
      }
    } else if (Array.isArray(k)) {
      k.forEach(keyframe => {
        if (keyframe.s && Array.isArray(keyframe.s)) {
          if (keyframe.s[0] < 0.3 && keyframe.s[1] < 0.3 && keyframe.s[2] < 0.3) {
            keyframe.s[0] = 1;
            keyframe.s[1] = 1;
            keyframe.s[2] = 1;
          }
        }
        if (keyframe.e && Array.isArray(keyframe.e)) {
          if (keyframe.e[0] < 0.3 && keyframe.e[1] < 0.3 && keyframe.e[2] < 0.3) {
            keyframe.e[0] = 1;
            keyframe.e[1] = 1;
            keyframe.e[2] = 1;
          }
        }
      });
    }
  }
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      makeLottieColorsBright(obj[key]);
    }
  }
}

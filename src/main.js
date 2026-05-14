import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initThreeBackground, triggerWarp } from './three-bg.js';
import { initWarpTransition } from './warp-transition.js';

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

/* ============ PROJECT CARDS ============ */
function initProjectCards() {
  gsap.from('#projects-header', {
    y: 50, opacity: 0, duration: 0.8,
    scrollTrigger: { trigger: '#projects', start: 'top 80%' }
  });

  // Cards stagger in
  gsap.from('.project-card', {
    y: 80, opacity: 0, duration: 0.6,
    stagger: 0.1,
    ease: 'back.out(1.4)',
    scrollTrigger: { trigger: '.projects-grid', start: 'top 80%' }
  });

  // 3D tilt on hover
  document.querySelectorAll('.project-card').forEach(card => {
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
    virtualScrollY = 5000000; // Start at a huge number for infinite backward scroll
    
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

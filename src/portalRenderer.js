/**
 * portalRenderer.js
 * Fetches Education & Experience data from Supabase and renders
 * the same Space Room HTML that was previously hardcoded in index.html.
 * Falls back to the original hardcoded strings if Supabase is unreachable.
 */

import { supabase, isSupabaseConfigured } from './supabaseClient.js';

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function galleryAttr(gallery) {
  if (!gallery || !gallery.length) return '';
  return `data-gallery='${JSON.stringify(gallery)}'`;
}

function slideshow(gallery, floatClass = 'floating-element') {
  if (!gallery || !gallery.length) return '';
  const slides = gallery
    .map((g, i) => `<img src="${g.src}" class="slide-img${i === 0 ? ' active' : ''}" alt="${g.caption || ''}">`)
    .join('\n');
  return `
    <div class="photo-slideshow ${floatClass}" ${galleryAttr(gallery)}>
      ${slides}
      <span class="photo-caption">${gallery[0]?.caption || ''}</span>
    </div>`;
}

function bullets(arr) {
  if (!arr || !arr.length) return '';
  return arr.map(b => `<p class="m-desc">• ${b}</p>`).join('\n');
}

// ─── EDUCATION RENDERER ──────────────────────────────────────────────────────

function renderEducationEntry(edu, index) {
  const align = index % 2 === 0 ? '' : ' right-align';
  const zDepth = -3000 * (index + 1);
  const floatA = index % 2 === 0 ? 'floating-element' : 'floating-element-delay';
  const floatB = index % 2 === 0 ? 'floating-element-delay' : 'floating-element';

  return `
    <div class="space-item${align}" data-z="${zDepth}">
      ${edu.logo_url ? `<img src="${edu.logo_url}" class="space-logo portal-logo ${floatB}" alt="${edu.institution}">` : ''}
      ${slideshow(edu.gallery, floatA)}
      <div class="space-card ${floatA}">
        <span class="m-date">${edu.year}</span>
        <h3>${edu.institution}</h3>
        <p class="m-role">${edu.degree}</p>
        <div class="m-desc-wrapper">
          ${bullets(edu.bullets)}
        </div>
      </div>
    </div>`;
}

export async function buildEducationHTML(fallbackHTML) {
  if (!isSupabaseConfigured || !supabase) return fallbackHTML;

  try {
    const { data, error } = await supabase
      .from('education')
      .select('*')
      .order('display_order', { ascending: true });

    if (error || !data?.length) return fallbackHTML;

    const entries = data.map((edu, i) => renderEducationEntry(edu, i)).join('\n');

    return `
      <div class="space-item space-title-item" data-z="0">
        <div class="scifi-title-hud floating-element">
          <div class="scifi-icon lottie-container" id="lottie-space-education"></div>
          <h2 class="space-title">ACADEMIC ARCHIVES</h2>
          <div class="scifi-telemetry">
            <span>SYS: ONLINE</span>
            <span>ENTRIES: ${data.length}</span>
            <span>SELECT * FROM education</span>
          </div>
        </div>
      </div>
      ${entries}`;
  } catch {
    return fallbackHTML;
  }
}

// ─── EXPERIENCE RENDERER ─────────────────────────────────────────────────────

function renderExperienceEntry(exp, index, baseZ) {
  const align = index % 2 === 0 ? '' : ' right-align';
  const zDepth = baseZ - 3000 * index;
  const floatA = index % 2 === 0 ? 'floating-element' : 'floating-element-delay';
  const floatB = index % 2 === 0 ? 'floating-element-delay' : 'floating-element';

  return `
    <div class="space-item${align}" data-z="${zDepth}">
      ${exp.logo_url ? `<img src="${exp.logo_url}" class="space-logo portal-logo ${floatB}" alt="${exp.company}">` : ''}
      ${slideshow(exp.gallery, floatA)}
      <div class="space-card ${floatA}">
        <span class="m-date">${exp.period}</span>
        <h3>${exp.company}</h3>
        <p class="m-role">${exp.role}</p>
        <div class="m-desc-wrapper">
          ${bullets(exp.bullets)}
        </div>
      </div>
    </div>`;
}

export async function buildExperienceHTML(fallbackHTML) {
  if (!isSupabaseConfigured || !supabase) return fallbackHTML;

  try {
    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .order('display_order', { ascending: true });

    if (error || !data?.length) return fallbackHTML;

    const professional = data.filter(e => e.type === 'professional');
    const projects = data.filter(e => e.type === 'project');

    const profHTML = professional
      .map((exp, i) => renderExperienceEntry(exp, i, -3000))
      .join('\n');

    // Project Archives section title + entries
    const projStartZ = -3000 * (professional.length + 1);
    const projHTML = projects
      .map((exp, i) => renderExperienceEntry(exp, i, projStartZ - 3000))
      .join('\n');

    const projSection = projects.length ? `
      <div class="space-item space-title-item" data-z="${projStartZ}">
        <div class="scifi-title-hud floating-element">
          <div class="scifi-icon lottie-container" id="lottie-space-project-archives"></div>
          <h2 class="space-title">PROJECT ARCHIVES</h2>
          <div class="scifi-telemetry">
            <span>DATABASE: ACCESSED</span>
            <span>TYPE: ANALYTICAL PROJECTS</span>
            <span>QUERY: SUCCESS</span>
          </div>
        </div>
      </div>
      ${projHTML}` : '';

    return `
      <div class="space-item space-title-item" data-z="0">
        <div class="scifi-title-hud floating-element">
          <div class="scifi-icon lottie-container" id="lottie-space-experience"></div>
          <h2 class="space-title">PROFESSIONAL LOGS</h2>
          <div class="scifi-telemetry">
            <span>AUTH: VERIFIED</span>
            <span>ENTRIES: ${professional.length}</span>
            <span>SELECT * FROM career</span>
          </div>
        </div>
      </div>
      ${profHTML}
      ${projSection}`;
  } catch {
    return fallbackHTML;
  }
}

// ─── PROJECTS & SKILLS DYNAMIC SUPABASE SYNC ─────────────────────────────────

export async function syncProjectsDataFromSupabase(targetProjectsObj) {
  if (!isSupabaseConfigured || !supabase) return;

  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('display_order', { ascending: true });

    if (error || !data?.length) return;

    data.forEach(p => {
      const key = p.slug || p.id;
      const existing = targetProjectsObj[key] || {};

      targetProjectsObj[key] = {
        ...existing,
        title: p.title || existing.title,
        category: p.category || existing.category,
        accent: p.accent || existing.accent || 'var(--accent-customer)',
        client: p.client ?? existing.client,
        timeline: p.timeline || existing.timeline,
        role: p.role ?? existing.role,
        caseOverview: p.case_overview || p.caseOverview || existing.caseOverview,
        scopeGoals: p.scope_goals || p.scopeGoals || existing.scopeGoals,
        summary: p.summary || existing.summary,
        tools: (p.tools && p.tools.length > 0) ? p.tools : (existing.tools || []),
        methodology: (p.methodology && p.methodology.length > 0) ? p.methodology : (existing.methodology || []),
        analysisPlaceholder: p.analysis_placeholder || p.analysisPlaceholder || existing.analysisPlaceholder || 'Analysis & Dashboard Overview',
        liveLink: p.live_link || p.liveLink || existing.liveLink || '',
        structure: existing.structure || (p.category === 'Data Visualization' ? 2 : (p.category === 'Impact Projects' ? 1 : 3))
      };
    });

    console.log(`✅ Dynamically synced ${data.length} projects from Supabase!`);
  } catch (err) {
    console.warn('Failed to sync projects from Supabase:', err);
  }
}

export async function fetchSkillsFromSupabase() {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('display_order', { ascending: true });

    if (error || !data?.length) return null;
    return data;
  } catch {
    return null;
  }
}

export async function renderSkillsFromSupabase() {
  const container = document.querySelector('.skills-grid');
  if (!container || !isSupabaseConfigured || !supabase) return;

  try {
    const skills = await fetchSkillsFromSupabase();
    if (!skills || !skills.length) return;

    // Group skills by category
    const categoriesMap = {
      'Data Analytics & BI': { icon: '📊', accent: '1', items: [] },
      'AI & Machine Learning': { icon: '🧠', accent: '2', items: [] },
      'Cloud & Dev Tools': { icon: '🛠️', accent: '3', items: [] }
    };

    skills.forEach(s => {
      if (!categoriesMap[s.category]) {
        categoriesMap[s.category] = { icon: '⚡', accent: '1', items: [] };
      }
      categoriesMap[s.category].items.push(s);
    });

    const categoryHTML = Object.entries(categoriesMap)
      .filter(([_, cat]) => cat.items.length > 0)
      .map(([catName, cat]) => {
        const badgesHTML = cat.items.map(s => `
          <div class="skill-badge">
            <img src="${s.icon_url}" class="${s.icon_type === 'simple-icon' ? 'simple-icon' : ''}" alt="${s.name}">
            <span>${s.name}</span>
          </div>`).join('');

        return `
          <div class="skill-category" data-accent="${cat.accent}">
            <div class="category-header">
              <div class="category-icon">${cat.icon}</div>
              <h3 class="category-title">${catName}</h3>
            </div>
            <div class="skill-badges">
              ${badgesHTML}
            </div>
          </div>`;
      }).join('\n');

    container.innerHTML = categoryHTML;
    console.log(`✅ Dynamically rendered ${skills.length} skills across ${Object.keys(categoriesMap).length} categories from Supabase!`);
  } catch (err) {
    console.warn('Failed to render skills from Supabase:', err);
  }
}

export async function renderCategoriesFromSupabase() {
  const container = document.querySelector('.project-categories');
  if (!container || !isSupabaseConfigured || !supabase) return;

  try {
    const { data, error } = await supabase
      .from('project_categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error || !data?.length) return;

    container.innerHTML = data.map(c => `
      <div class="category-card${c.filter_key === 'all' ? ' active' : ''}" data-filter="${c.filter_key}">
        <div class="category-icon-anim" id="lottie-cat-${c.filter_key}"></div>
        <span>${c.name}</span>
      </div>`).join('\n');

    console.log(`✅ Dynamically rendered ${data.length} project categories from Supabase!`);
  } catch (err) {
    console.warn('Failed to render project categories from Supabase:', err);
  }
}

export async function renderProjectCardsFromSupabase() {
  const container = document.getElementById('projects-carousel-container');
  if (!container || !isSupabaseConfigured || !supabase) return;

  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('display_order', { ascending: true });

    if (error || !data?.length) return;

    container.innerHTML = data.map(p => {
      const accentNum = ((p.display_order - 1) % 3) + 1;
      const bgImgHTML = p.bg_image_url ? `<div class="card-bg-image" style="background-image: url('${p.bg_image_url}');"></div>` : '';
      const tagsHTML = (p.card_tags || p.tools || []).map(t => `<span class="tag">${t}</span>`).join('');

      return `
        <div class="project-card" data-id="${p.slug}" data-accent="${accentNum}" data-categories="${p.filter_key || 'customer'}"
          style="--accent-color: ${p.accent || 'var(--accent-customer)'}; --accent-rgb: ${p.accent_rgb || '168, 85, 247'};">
          ${bgImgHTML}
          <div class="card-meta">
            <span class="card-number">${String(p.display_order).padStart(2, '0')}</span>
            <span class="card-category">${p.category}</span>
          </div>
          <h3 class="card-title">${p.card_title || p.title}</h3>
          <p class="card-desc">${p.card_desc || p.summary}</p>
          <div class="card-tags">
            ${tagsHTML}
          </div>
        </div>`;
    }).join('\n');

    console.log(`✅ Dynamically rendered ${data.length} project cards from Supabase!`);
  } catch (err) {
    console.warn('Failed to render project cards from Supabase:', err);
  }
}


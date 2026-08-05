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

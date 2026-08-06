import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { projectsData } from '../src/projectsData.js';

try {
  const envContent = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valParts] = trimmed.split('=');
      if (key && valParts.length > 0) process.env[key.trim()] = valParts.join('=').trim();
    }
  });
} catch (e) {}

const url = process.env.VITE_SUPABASE_URL || 'https://pgbwebhatdhhdjafmcon.supabase.co';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

const knowledgeItems = [
  // ── 1. PROFILE SUMMARY ──
  {
    title: 'Fakhri Budiman Profile & Background Summary',
    category: 'profile',
    content: 'Muhammad Fakhri Musyaffa Budiman is a Data Analyst & AI Specialist with a Master of Science (MSc) in Business Analytics from the University of Warwick (UK) and a Bachelor of Engineering in Industrial Engineering from Telkom University. He is an LPDP Awardee. Fakhri specializes in Data Analytics, Business Intelligence, Machine Learning (Scikit-Learn, LightGBM, PyTorch), SQL/BigQuery, Tableau, and Generative AI / RAG system development.'
  },

  // ── 2. EDUCATION ──
  {
    title: 'University of Warwick MSc Business Analytics',
    category: 'education',
    content: 'Fakhri earned an MSc in Business Analytics with Distinction/Merit from Warwick Business School, University of Warwick (2024-2025). Key coursework included Data Analytics, Forecasting, Machine Learning, Financial Analytics, and Optimization. Awarded full scholarship by LPDP.'
  },
  {
    title: 'Telkom University Industrial Engineering',
    category: 'education',
    content: 'Fakhri earned a Bachelor of Engineering (S.T.) in Industrial Engineering from Telkom University (2018-2022) with Cum Laude honours (GPA 3.68/4.00). Specialized in Operational Research, Database Design, and Supply Chain Analytics.'
  },
  {
    title: 'Solbridge International School of Business Exchange',
    category: 'education',
    content: 'Fakhri completed an International Exchange Program in Business Administration & Management at Solbridge International School of Business in South Korea (2021).'
  },

  // ── 3. PROFESSIONAL EXPERIENCES ──
  {
    title: 'PT Rakamin Kolektif Madani - Data Analyst Intern',
    category: 'experience',
    content: 'Fakhri worked as a Data Analyst Intern at Rakamin Academy (RevoU / Rakamin ecosystem). He performed end-to-end user retention analysis, SQL data transformations on BigQuery, and built Tableau dashboards that improved campaign targeting by 25%.'
  },
  {
    title: 'RevoU - Data Analytics Team Lead & Mentor',
    category: 'experience',
    content: 'Fakhri served as a Team Lead for Data Analytics Labs at RevoU. He guided student cohorts in SQL, Python, Tableau, and business case studies, achieving a 4.9/5 mentor satisfaction rating.'
  },
  {
    title: 'PT Kaltim Methanol Industri - Industrial Engineering & Data Intern',
    category: 'experience',
    content: 'Fakhri analyzed chemical plant operational metrics, downtime logs, and inventory data at PT Kaltim Methanol Industri, delivering process optimization recommendations.'
  },
  {
    title: 'Kemensos Social Aid (Bansos) Distribution Analysis',
    category: 'experience',
    content: 'Fakhri assisted the Ministry of Social Affairs (Kemensos) in Sukoharjo region, transforming over 1.5 million unstructured social aid records using Python, Tableau Prep, and Looker Studio. Reduced report generation time by 80%.'
  },
  {
    title: 'LPDP PK 239 - Head of Database Management',
    category: 'experience',
    content: 'Fakhri served as Head of Database Management for LPDP PK 239 (316 awardees), building a centralized SQL and Google Sheets tracking system with 100% data accuracy.'
  },
  {
    title: 'SQL Academy PPI UK - Curriculum Lead & Instructor',
    category: 'experience',
    content: 'Fakhri co-founded and instructed SQL Academy for PPI UK, teaching advanced SQL window functions, subqueries, and CTEs to 35 Indonesian students across the UK.'
  }
];

// ── 4. ADD ALL 25 PROJECTS FROM projectsData ──
Object.entries(projectsData).forEach(([slug, proj]) => {
  const toolsStr = (proj.tools || []).join(', ');
  const methodologyStr = (proj.methodology || []).map(m => `${m.title}: ${m.desc}`).join('; ');
  
  let content = `Project: ${proj.title}. Category: ${proj.category}. Client/Context: ${proj.client || 'N/A'}. Role: ${proj.role || 'Data Analyst'}. Timeline: ${proj.timeline || '2023'}.\n`;
  content += `Overview: ${proj.caseOverview || proj.overviewText || proj.description || proj.summary || ''}\n`;
  content += `Scope & Goals: ${proj.scopeGoals || proj.impactText || ''}\n`;
  content += `Summary & Results: ${proj.summary || ''}\n`;
  content += `Tools Used: ${toolsStr}\n`;
  if (methodologyStr) content += `Methodology: ${methodologyStr}\n`;
  if (proj.liveLink) content += `Live Link: ${proj.liveLink}\n`;

  knowledgeItems.push({
    title: proj.title,
    category: 'project',
    content: content.trim(),
    metadata: { slug, tools: proj.tools || [], category: proj.category }
  });
});

// ── 5. ADD RAW EXTRACTED PDF TEXT FROM portfolio_extracted_text.txt ──
try {
  const rawText = fs.readFileSync(path.join(process.cwd(), 'portfolio_extracted_text.txt'), 'utf8');
  const pages = rawText.split(/--- PAGE \d+ ---/);

  pages.forEach((pageContent, idx) => {
    const trimmed = pageContent.replace(/={10,}/g, '').trim();
    if (trimmed.length > 40 && !trimmed.startsWith('=== PORTFOLIO EXTRACTED TEXT ===')) {
      const firstLine = trimmed.split('\n')[0].replace(/[^a-zA-Z0-9\s]/g, '').trim();
      const title = firstLine.length > 5 ? `Portfolio PDF Page ${idx}: ${firstLine}` : `Portfolio PDF Page ${idx}`;

      knowledgeItems.push({
        title,
        category: 'extracted_pdf',
        content: trimmed,
        metadata: { page: idx, source: 'Portfolio_Fakhri Budiman (3).pdf' }
      });
    }
  });

  console.log(`📄 Successfully parsed pages from portfolio_extracted_text.txt!`);
} catch (err) {
  console.warn('Could not read portfolio_extracted_text.txt:', err.message);
}

async function seedPortfolioKnowledge() {
  console.log(`🧠 Seeding ${knowledgeItems.length} knowledge chunks into portfolio_knowledge table...`);

  // Clear existing items
  const { error: delErr } = await supabase.from('portfolio_knowledge').delete().neq('title', '');
  if (delErr) console.warn('Delete warning:', delErr.message);

  // Insert in batches of 25 to avoid payload limits
  const batchSize = 25;
  let insertedTotal = 0;

  for (let i = 0; i < knowledgeItems.length; i += batchSize) {
    const batch = knowledgeItems.slice(i, i + batchSize);
    const { data, error } = await supabase.from('portfolio_knowledge').insert(batch).select();

    if (error) {
      console.error(`❌ Failed batch ${i / batchSize + 1}:`, error.message);
    } else {
      insertedTotal += data.length;
    }
  }

  console.log(`✅ Successfully seeded ALL ${insertedTotal} knowledge chunks into Supabase portfolio_knowledge!`);
}

seedPortfolioKnowledge().catch(console.error);

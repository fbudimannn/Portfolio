---
name: Fakhri Budiman Portfolio
description: Space & Cyberpunk Sci-Fi Interactive Portfolio Design System
colors:
  primary: "#38bdf8"
  secondary: "#3b82f6"
  accent-ai: "#10b981"
  accent-ml: "#00f0ff"
  accent-ab: "#ec4899"
  accent-viz: "#14b8a6"
  accent-impact: "#f59e0b"
  accent-customer: "#a855f7"
  neutral-bg: "#020617"
  surface: "#0f172a"
  surface-el: "#1e293b"
  text-primary: "#e2e8f0"
  text-dim: "#94a3b8"
typography:
  display:
    fontFamily: "Syne, sans-serif"
    fontWeight: 700
  body:
    fontFamily: "DM Sans, sans-serif"
    fontWeight: 400
  mono:
    fontFamily: "Space Mono, monospace"
    fontWeight: 400
rounded:
  sm: "6px"
  md: "12px"
  lg: "20px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "48px"
components:
  card-primary:
    backgroundColor: "rgba(15, 23, 42, 0.7)"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "24px"
  button-portal:
    backgroundColor: "rgba(56, 189, 248, 0.1)"
    textColor: "{colors.primary}"
    rounded: "{rounded.sm}"
    padding: "12px 24px"
---

# Design System: Fakhri Budiman Portfolio

## Overview

**Creative North Star: "The Deep-Space Tactical Command Terminal"**

Fakhri Budiman's portfolio is designed as an ultra-immersive sci-fi space command center. Visitors experience a 3D canvas starfield, holographic glassmorphism cards, sci-fi HUD telemetry UI overlays, interactive 3D portals (Academic Archives & Professional Logs), and an integrated AI RAG Assistant.

**Key Characteristics:**
- **Cosmic Atmospheric Depth:** Deep space black background (`#020617`) with cyan/blue starlight.
- **Glassmorphism & Neon Telemetry:** Multi-layered translucent panels (`rgba(13, 13, 31, 0.7)`) with neon blue glowing borders.
- **Data-Driven Dynamic Architecture:** 100% of skills, categories, projects, education, and experience are fetched live from Supabase.

---

## Colors

The palette combines deep slate space tones with vibrant neon accents that identify different data categories.

### Primary
- **Command Cyan** (`#38bdf8`): Hero glows, interactive borders, primary focus states.
- **Hyperdrive Blue** (`#3b82f6`): Primary buttons, active navigation indicators, selections.

### Category Accents
- **Customer Behaviour** (`#a855f7`): Neon Purple
- **Machine Learning & F1** (`#00f0ff`): Electric Cyan
- **Applied AI & RAG** (`#10b981`): Emerald Green
- **A/B Testing** (`#ec4899`): Hot Pink
- **Data Visualization** (`#14b8a6`): Muted Teal
- **Impact Projects** (`#f59e0b`): Amber Gold

### Neutral
- **Cosmic Void** (`#020617`): Main page background.
- **Deep Slate** (`#0f172a`): Glass card background.
- **Starlight White** (`#e2e8f0`): Primary headings and body copy.
- **Telemetry Muted** (`#94a3b8`): Secondary telemetry labels and metadata.

**The Ten Percent Glow Rule.** Neon accent glow is restricted to ≤10% of surface area to maintain high visual contrast and editorial readability.

---

## Typography

**Display Font:** `Syne` (Bold, Display headlines)
**Body Font:** `DM Sans` (Clean, highly readable body copy)
**Telemetry Font:** `Space Mono` (Technical labels, dates, telemetry statistics)

---

## Layout

- **Container Width:** `max-width: 1200px` centered with dynamic side padding.
- **Vertical Spacing:** `clamp(5rem, 8vh, 7.5rem)` between major sections.
- **Responsive Breakpoints:**
  - Desktop (>950px): 9 projects per page grid carousel.
  - Tablet (601px - 950px): 6 projects per page grid carousel.
  - Mobile (≤600px): 3 projects per page list card view.

---

## Elevation & Depth

- **Rest State:** Flat glass translucent background with `backdrop-filter: blur(12px)` and 1px border `rgba(255, 255, 255, 0.06)`.
- **Hover State:** Lifted `transform: translateY(-4px)` with neon glow shadow `0 10px 30px rgba(56, 189, 248, 0.15)`.

---

## Shapes

- **Project & Skill Cards:** `border-radius: 12px` to 16px.
- **Filter Chips & Badges:** `border-radius: 6px` to 8px.

---

## Components

### Project Cards
- Rendered dynamically from Supabase `projects` table.
- Features card number (01-25), category tag, title, description, tool badges, and category accent glow.

### Skills Badges
- Rendered dynamically from Supabase `skills` table (19 individual badges).
- Grouped into 3 categories: *Data Analytics & BI*, *AI & Machine Learning*, and *Cloud & Dev Tools*.

### Dynamic Space Portals
- Education & Experience portals render 3D depth items (`data-z`) dynamically from Supabase `education` and `experiences` tables.

---

## Do's and Don'ts

### Do:
- **Do** manage content via Supabase tables (`projects`, `skills`, `experiences`, `education`, `project_categories`).
- **Do** keep Lottie paths, accent colors, and display orders aligned in Supabase.
- **Do** ensure all text on glass cards meets WCAG AAA contrast ratio standards against deep space backdrops.

### Don't:
- **Don't** hardcode raw project data in `index.html`. All cards should hydrate dynamically from Supabase with static HTML fallbacks.
- **Don't** break category color token assignments.

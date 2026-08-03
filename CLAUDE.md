# thomasdinatale.com — Portfolio

Personal portfolio for Thomas DiNatale, product design leader.

## Design system (read first)

The machine-readable design system is the single source of truth for building on this site:

- `design-system/DESIGN-SYSTEM.md` — AI-facing guide: theme model, type scale, full component inventory, rules, and gotchas (inert `font-stretch`, legacy "Instrument Sans" comments, `cs-` vs `cs2-`).
- `design-system/tokens.json` — exact token values (colors × 3 themes, typography, spacing, radii, shadows, motion, layout).

**Before writing HTML/CSS, read those two files.** Always reference colors via `var(--token)`, never raw hex. The token table below is a quick reference; the files above are authoritative.

## Stack

- Static HTML/CSS/JS — no framework, no build step
- Font: Libre Franklin (Google Fonts), variable weight axis (400–900) + italic — no width axis
- Deployed on Vercel

## Deployment

**Always deploy via CLI — GitHub is NOT connected to Vercel:**
```
vercel --prod
```

**Push to GitHub via GitHub Desktop** — terminal has no GitHub HTTPS auth configured.

Git user: `hi@thomasdinatale.com` / Thomas DiNatale

## Project structure

```
index.html              — Homepage
case-study/             — Case study pages
article/                — Article pages
css/styles.css          — Global styles + design tokens
css/case-study.css      — Case study page styles
js/case-study.js        — Scroll/fade animation
assets/images/          — All images (permanent local copies)
```

## Design tokens

| Name      | Value     | Usage                        |
|-----------|-----------|------------------------------|
| --plaster | #f5f0eb   | Page background              |
| --ember   | #d24f39   | Accent / hover color         |
| --pitch   | #302d2f   | Primary text                 |
| --flint   | #6a6869   | Secondary text               |
| --chalk   | #fffcf8   | Light surface                |
| --linen   | #ede9dc   | Thinking section background  |
| --shale   | #dcdcdc   | Borders / dividers           |
| --cloud   | #ffffff   | White                        |

## Typography

- Body: Libre Franklin, regular weight (400)
- Display/H1: Libre Franklin, bold (700), `line-height: 1`
- Project/article card titles: 24px, semibold (600)
- Note: `font-stretch: condensed` / `font-variation-settings: 'wdth'` rules remain in the CSS but are inert — Libre Franklin has no width axis, so headings render at normal width

## Case study heading outline

Every case study page follows one semantic heading hierarchy (styling is class-based, so tags never change appearance):

| Level | Class | Role |
|-------|-------|------|
| `<h1>` | `cs2-headline` | Project name (one per page) |
| `<h2>` | `cs2-tagline cs2-tagline--display` | Hero tagline |
| `<h2>` | `cs2-problem-title` | Problem-card section titles |
| `<h3>` | `cs-section-title` | Feature section titles |

Keep it clean: exactly one `<h1>`, no skipped levels. Don't use `<p>` for anything in this table.

## Key conventions

- LinkedIn icon uses CSS mask (`mask-image` + `background-color: var(--ember)` on hover) — not a filter
- `<img>` tags for LinkedIn icon are replaced with `<span class="nav-icon" aria-hidden="true"></span>` across all pages
- Case study hero body paragraphs: `cs2-body` div with `display: flex; flex-direction: column; gap: 24px`
- Figma asset images expire after 7 days — always download to `assets/images/` immediately
- Nav autoscroll on homepage uses `window._scrollTarget` + `scrollIntoView` on load

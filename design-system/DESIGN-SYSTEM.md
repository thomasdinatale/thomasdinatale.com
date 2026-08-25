# Design System — thomasdinatale.com

The single source of truth for building on this portfolio, written for AI-assisted development. Read this before touching HTML/CSS. Exact values live in [`tokens.json`](./tokens.json); this file explains **how to use them** — the class-based component API, the rules, and the gotchas.

## How to use this (for an AI agent)

1. **Never hardcode a color, radius, or shadow.** Reference the CSS custom property: `color: var(--pitch)`, `background: var(--linen)`. The raw hex in `tokens.json` is reference-only so you know what a var resolves to per theme.
2. **Reuse a component class before writing new CSS.** The inventory below is exhaustive for the current site. If something fits, use its class — don't restyle from scratch.
3. **Match the semantic heading hierarchy** (see below). Styling is class-based, so tags never change appearance — pick the correct tag *and* the correct class.
4. **Respect the gotchas** at the bottom. Several inert/legacy rules in the CSS will mislead you if you take them at face value.

## Themes & color

Three themes, all driven by CSS custom properties on `:root` — see `tokens.json > color` for the full table and `$meta.themeMechanism` for how each is triggered.

- **light** — default (`:root`)
- **dark** — OS `prefers-color-scheme: dark` (unless `.theme-light` forces light), or forced with `.theme-dark`
- **extraDark** — `.theme-extra-dark`, the second *user-facing* theme (the nav circle toggles light ⇆ extra-dark; plain `.theme-dark` is retained in CSS but no longer reachable through the UI)

Because everything flows through the vars, **correct token usage gets you all three themes for free.** The moment you hardcode a hex, you break dark mode.

Signature move — the **card border gradient**: `linear-gradient(122deg, var(--cloud) 0%, var(--metal) 100%)` painted on `border-box`, with `linear-gradient(var(--chalk), var(--chalk)) padding-box` for the fill. This is why `--cloud` and `--metal` exist; they are gradient stops, not surfaces.

## Type scale

Full details in `tokens.json > typography.scale`. The workhorse is **body: 18px / 400 / 1.6**. Quick map of role → class:

| Role | Size / Weight | Use for | Example class |
|------|---------------|---------|---------------|
| Display | 80 / 800 · lh 1 | Page H1, project name | `.hero h1`, `.cs2-headline` |
| H2 section | 48 / 700 · lh 1.4 | Section headlines | `.thinking-headline`, `.about-headline` |
| H2 problem | 32 / 700 · lh 1.4 | Problem cards, display tagline | `.cs2-problem-title`, `.cs2-tagline--display` |
| Card title | 24 / 600 | Card + section titles | `.project-title`, `.cs-section-title`, `.history-group-title` |
| Lead body | 24 / 400 · lh 1.6 | Hero / case-study lead | `.hero p`, `.cs2-body p` — both pitch, both uncapped |
| **Body** | **18 / 400 · lh 1.6** | **default paragraph** | `.cs-copy-block p`, `.article-section p` |
| Body semibold | 18 / 600 · lh 1.6 | Sub-heads below a section title | `.text-body-semibold` (global), `.cs-body-semibold` (inline) |
| Caption | 14–16 / 400 · flint | Image captions | `.cs2-cap`, `.cs-caption` |
| Eyebrow | 14 / 700 · uppercase · +tracking | Labels, date pills | `.cs2-problem-eyebrow`, `.history-date` (pitch) |
| Section kicker | 14 / 700 · uppercase · +tracking · flint | Label above a section title | `.cs-section-title[data-eyebrow]::before` |

## Semantic heading hierarchy (case studies)

Exactly one `<h1>` per page, no skipped levels. Tags are chosen for semantics; classes drive appearance.

| Level | Class | Role |
|-------|-------|------|
| `<h1>` | `cs2-headline` | Project name (one per page) |
| `<h2>` | `cs2-tagline cs2-tagline--display` | Hero tagline |
| `<h2>` | `cs2-problem-title` | Problem-card section titles |
| `<h3>` | `cs-section-title` | Feature section titles |
| `<h2>` | `cs-more-title` | "More case studies" cross-link section |
| `<h3>` | `project-title` | Cross-link card titles |

Don't use `<p>` for anything in this table.

## Component inventory

Every reusable pattern currently in the site, with its class and where it's defined. Prefer these; extend them rather than forking.

### Global (`css/styles.css`)
- **Nav** — `nav` (sticky, transparent → `.scrolled` gives chalk bg + shale border). `.nav-inner` holds just two things now: `.nav-mark` + `.nav-square` (24px SVG circle) + `.nav-wordmark` on the left, and `.nav-toggle` (24×16 three-bar button, ember on hover) on the right. All links/contact/theme moved into the slide-out panel below. `.nav-links`/`.nav-jump-links`/`.nav-link`/`.nav-divider` were deleted on 2026-08-25. `.nav-icon`/`.nav-mail`/`.theme-toggle` CSS still exists and `js/case-study.js` still queries `.nav-mail` and `.nav-icon-link`, but neither appears in markup, so those handlers bind to nothing.
- **Nav panel (small slide-out menu)** — hamburger opens `.nav-panel` (560px, right-anchored, same slide easing + shadow as the case-study panel but smaller). `.nav-panel-scrim` + `:root.nav-open` lock scroll; `.nav-panel-top` → `.nav-panel-close` (20px X, rotates on hover) + `.nav-panel-menu`/`.nav-panel-item` (96px row, zero padding so the words sit flush on the panel's 48px inset with the note and social row below; 80px `.nav-panel-word`, no rules or numerals, word→ember on hover) + `.nav-panel-note`; `.nav-panel-footer` → `.nav-panel-mode` (light/dark toggle, label flips "Turn the lights on/off") + `.nav-panel-social` (LinkedIn/GitHub/Instagram, inline SVG + `currentColor`, ember on hover). Controller lives in `js/case-study.js` (`data-nav-open`/`data-nav-close`/`data-nav-mode`), independent of the large `#evolved-panel` case-study panel.
- **Tooltip** — `.tooltip` (shale bg, 4px radius); nav variant positions below icon and force-shows via `.is-visible` for the email "Copied!" state.
- **Buttons / CTAs** — `.projects-cta-btn` (4px radius, shale border → ember border + ember text on hover, 20/600).
- **Links** — `.text-link` (pitch text, ember underline, full ember on hover), `.connect-link` (ember + underline).
- **Cards (homepage)** — `.project-card` (32px radius, gradient border, lifts on hover), `.project-card-image` with modifiers `--contain` / `--cover` / `--crop-bottom` and per-project hover fills `--primer/--butcherbox/--nara/--grapevine`. `.article-card` (32px radius, gradient border, ember stroke fades in via `::after`), `.article-image` (dimmed → full on hover).
- **Theme-paired artwork** — article thumbnails ship as two renders of the same generative frame: `thinking-article-N.webp` (dark ground) and `thinking-article-N-light.webp` (light ground), both 972×486. Markup carries both as `<img class="img-dark">` + `<img class="img-light">`; CSS shows one per theme (class-based, with a `prefers-color-scheme` fallback). Rest state differs by theme — dark dims with `brightness(0.62)`, light fades to `opacity: 0.75` (brightness would grey the plaster ground); both go full on card hover. **Adding an article means exporting both renders.**
- **Principles** — `.about-principles-list` / `.about-principle` (num + name row, shale bottom rule).
- **Photos carousel** — `.photos`, `.photos-grid`, `.photo-item` (12px chalk frame + layered shadow), `.photos-btn` (ember arrows).
- **Footer** — `.footer` / `.footer--linen` (linen bg), `.footer-inner` (space-between). `.footer-credits` (copyright • made-by, 14px flint, `.footer-dot` 4px separator) on the left; `.footer-social` (LinkedIn/GitHub/Instagram, 24px inline-SVG `currentColor`, pitch → ember on hover, same-tab) on the right. Mobile: `column-reverse` puts icons (32px) above the stacked credits; dot hidden.
- **Scroll fade-in** — `.fade-in` → `.fade-in.visible` (JS adds `.visible`; see `js/case-study.js`).
- **Work/history page** — `.history` splits into `.history-group` bands over their own `.history-grid`. The first band is deliberately unlabelled — it is the long-term work and reads as the default — while the two below it carry a `.history-group-title` (24/600, `padding-left: 32px`, so it sits on the card text's left edge, not the hero's). `.history-card` carries the same 1px gradient stroke and 32px radius as `.project-card`/`.article-card`; `.history-title` (H5/700), `.history-date` (uppercase eyebrow, pitch), `.history-desc` (body, flint), `.history-tag` (the shared Tag — identical to `.project-tag`). Case-study cards close with `.history-tags`: tags left, `.history-cta` pushed to the far edge by `margin-left: auto`. The CTA borrows the Tag box and is sized `calc(1.6em + 10px)` square — the tag's own line box plus its padding and border — so it stays exactly tag height without a magic number. It goes ember on card hover and focus. Only `--link` cards carry one.
- **Writing index page** — `.writing` (section), `.writing-list` (two-up grid, 20px gap, `align-items: start` so cards keep their own height), `.writing-card` (vertical: artwork over copy, 32px radius, gradient border, 32px padding, 24px gap, lift + `--shadow-card-hover` on hover). Same box as `.article-card` on the homepage, but with a date and a larger title, since here the cards are the page rather than a footnote to it. Inside: `.writing-image` (`aspect-ratio: 2 / 1`, 16px radius, `brightness(0.62)` → `1` on card hover) then `.writing-card-text` (`.writing-date` uppercase eyebrow → `.writing-title` H5/700 → `.writing-desc` body/flint, 8px gaps). Drops to one column at **1120px**, where 160px of section inset leaves two columns too narrow for an H5 title; mobile keeps one column at 24px padding.

### Case study (`css/case-study.css`)
- **Legacy `cs-` hero** — `.cs-hero` (1fr / 405px grid), `.cs-headline`, `.cs-hero-body`, `.cs-meta-card` (label/value fields), `.cs-hero-image-bg` + `.cs-hero-image` + `.cs-caption`. Inside `.cs-content-section`, captioned images use the `cs2-figure` + `cs2-cap` pair (ButcherBox); `.cs2-figure > img.cs-hero-image` keeps the legacy 1120px width instead of stretching to the figure.
- **Current `cs2-` hero** — `.cs2-hero` → `.cs2-hero-and-image` → `.cs2-hero-inner`; `.cs2-headline`, `.cs2-title-desc-metrics`, `.cs2-tagline(--display)`, `.cs2-body`, `.cs2-metrics` / `.cs2-metric` (linen card: value + arrow + label; `--stack` variant for vertical). Hero image: `.cs2-hero-image-card` (chalk, 24px) or `.cs2-hero-phones-row` (desktop) / `--mobile`.
- **Content flow** — `.cs2-flow` (48px gap column, max 1200px), `.cs-copy-block` (650px reading column), `.cs2-figure` + `.cs2-cap`, `.cs2-media` (+ `--wide` / `-img--sm` / `-img--watch`), `.cs2-image-pair`, `.cs2-phone-row`, `.cs2-watch-grid`, `.cs2-video`.
- **Problem card** — `.cs2-problem-card` (linen, 32px radius, 778px) with `.cs2-problem-eyebrow` / `.cs2-problem-title` / `.cs2-problem-body`; `--outcomes` variant adds `.cs2-outcomes-list`.
- **More case studies (cross-links)** — `.cs-more` sits between the content and the footer on every case study: `0 160px` padding, 48px gap, centered `.cs-more-title` (H5) over homepage `.project-card`s. Two links go in a `.projects-row` (`--half` + `--cover`); a single link is a `--wide` card with `--crop-bottom` directly in the section. Always **96px** below the last content block — `margin-top: 96px`, dropping to 64px via `:is(.cs2-flow, .cs-content-section):has(> .cs2-problem-card:last-child) + .cs-more` because a trailing results card already carries 32px. Mobile: 64px/32px, 16px padding, 32px gap.
- **"How this evolved" aside + slide-out panel** — `.cs-evolved` (linen card), `.panel-link` (opens panel, arrow bounces on hover), `.panel-scrim` + `.panel` (880px, right, `cubic-bezier(0.4,0,0.2,1)` slide), `.panel-header/.panel-body/.panel-content/.panel-section/.panel-block/.panel-shot`. Body scroll locks via `:root.panel-open`.

### Article (`css/article.css`)
- **Layout** — `.article-layout` (667px + 405px sticky sidebar, 50px gap).
- **Content** — `.article-header`, `.article-title-block`, `.article-date`, `.article-title`, `.article-intro`, `.article-divider`, `.article-section` (+ `.article-section-title`), `.article-body-semibold`, `.article-prompt` (italic, ember left rule), `.article-list`, `.article-img` (8px radius) + `.article-caption`.
- **Sidebar TOC** — `.article-meta-card` (linen), `.article-toc` with shale `.article-toc-track` + sliding ember `.article-toc-indicator`; `.article-sections-list li.active`.

## Layout constants

- Page max-width **1376px** (`.page`, all four index pages); `.hero` is capped at **1280px** and
  centres inside it, giving content a **48px shoulder** on each side. Case-study reading column
  **650px**; article grid **667 + 405** (gap 50). The hero paragraph has no `max-width` of its own,
  deliberately — the hero box is what bounds it, at 896px.
- Section padding desktop **`80px 160px`** (hero `80px 192px`). Cards and modules overhang the hero
  copy by **80px** a side: 48px from the shoulder plus the 32px the card box already sat outboard of
  its own text. Group titles and card text still share a rail with each other, 48px left of the hero.; nav **`16px 80px`**; mobile collapses sides to **16px** (articles/handoff use 24px).
- Single responsive breakpoint: **`max-width: 768px`** (panel has an extra one at 879px).
- Fixed background grid at **33px** cells (`.bg-grid`), plus `.bg-top-fade`.

## Rules

**Do**
- Use `var(--token)` for every color, **radius** (`--radius-xs/sm/md/lg/xl`), and **shadow** (`--shadow-*`) — all are live CSS vars in `styles.css` now, so never hardcode those px/rgba values. Spacing stays literal px (intentional optical values); use the `tokens.json` scale as a guide.
- Reuse an existing component class; add a `--modifier` class for a variant rather than new base CSS.
- Keep one `<h1>` per page and follow the heading table.
- Test both light and extra-dark (the nav circle toggles them) after any visual change.
- Download Figma assets to `assets/images/` immediately — Figma URLs expire after 7 days.

**Don't**
- Don't hardcode hex/rgba (breaks dark modes). Exceptions already in the code (`#ede9dc` meta card, scrim `rgba(0,0,0,.75)`) are documented in `tokens.json > colorNotes`; don't add new ones.
- Don't add a build step, framework, or dependency — this is static HTML/CSS/JS by design.
- Don't reach for `font-stretch: condensed` or `font-variation-settings: 'wdth'` expecting a visual change — see gotchas.
- Don't add breakpoints beyond 768px unless a layout genuinely needs it; the system is deliberately one-breakpoint.

## ⚠️ Gotchas (these will mislead you)

1. **Libre Franklin has no width axis — there is no condensed rendering.** `font-stretch` and `font-variation-settings: 'wdth' …` were stripped from the CSS because they did nothing. Don't add them back to "condense" a heading; they render at normal width. Weight (400–900) and italic are the only variable axes.
2. **Two case-study systems coexist:** legacy `cs-*` (ButcherBox, Grapevine) and current `cs2-*` (Primer, Nara). **Build new case studies with `cs2-*`.** Only touch `cs-*` when editing those specific legacy pages.
3. **LinkedIn icon is a CSS mask**, not an `<img>` and not a filter: `mask-image` + `background-color: var(--ember)` on hover. Use `<span class="nav-icon" aria-hidden="true">`.
4. **Dark mode auto-dims images** (`brightness/contrast/opacity` filter on all `img` except `.about-portrait`), restoring to full on card hover. Account for this when adding imagery.
5. **`.about-portrait` inverts in dark mode** (`filter: invert(1)`) because it's a transparent ink drawing — keep new line-art assets on transparent backgrounds if they should invert too.

## The /design-system page itself

`design-system.html` carries its own inline `<style>`; it does not add rules to
`styles.css`. As of 2026-08-25 its twelve sections are **accordions**, not
stacked blocks: each is a `<details class="pg-module" id="<slug>">` whose
`<summary class="pg-summary">` holds the `<h2 class="pg-section-h">` and a
`.pg-summary-chevron` that rotates 180° on `[open]` — the **Caret**, a 2px pitch stroke icon documented in the page's own Icons section using the identical path.

- `<details>`, not a JS accordion, on purpose: keyboard behaviour and semantics
  are free, it works with JS off, and find-in-page auto-expands a closed
  section in engines that support it.
- **Colors ships `open`.** It is the section that demonstrates live tokens
  ("switch themes and the swatch and its value change together"), so the page
  proves itself without a click. Everything else starts closed.
- The **Themes** row (`.pg-toolbar`) sits above the stack and is not a
  `<details>` — there is nothing to disclose. It borrows `.pg-summary`'s
  geometry (H5 title left, controls right, same card box) so it reads as the
  first row rather than a different kind of object; on mobile it stacks.
- Section ids are slugs of the title (`type-scale`, `calls-to-action`,
  `hover-motion`). An inline script at the end of `<body>` opens the section
  named in `location.hash` on load and on `hashchange`, re-settles the scroll
  on `load`, and `replaceState`s the hash as sections are opened.
- No open/close animation, deliberately: animating the height would reintroduce
  the layout-property transitions the rest of the site removed. Animate
  `opacity` if motion is wanted later.
- The page's own chrome uses only scale tokens — no raw `font-size` or
  `border-radius` values. Keep it that way; it is the page that publishes them.

## Where things live

```
css/styles.css        — tokens (:root) + global components + homepage + /work
css/case-study.css     — cs- (legacy) and cs2- (current) case-study systems + slide-out panel
css/article.css        — article pages + sticky TOC
js/case-study.js       — scroll fade-in, TOC tracking, panel open/close
design-system/          — THIS spec (tokens.json + DESIGN-SYSTEM.md)
```

## Deployment

Static site on Vercel. **Deploy via CLI** (GitHub is not connected to Vercel): `vercel --prod`. Push source to GitHub via **GitHub Desktop** (terminal has no GitHub HTTPS auth).

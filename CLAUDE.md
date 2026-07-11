# thomasdinatale.com — Portfolio

Personal portfolio for Thomas DiNatale, product design leader.

## Stack

- Static HTML/CSS/JS — no framework, no build step
- Font: Instrument Sans (Google Fonts), variable font with `wdth` axis
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

- Body: Instrument Sans, regular weight, `wdth` 100
- Display/H1: Instrument Sans Condensed, bold, `wdth` 75, `line-height: 1`
- SemiCondensed headings: `font-variation-settings: 'wdth' 87.5`
- Project/article card titles: 24px, semibold, `wdth` 87.5

## Key conventions

- LinkedIn icon uses CSS mask (`mask-image` + `background-color: var(--ember)` on hover) — not a filter
- `<img>` tags for LinkedIn icon are replaced with `<span class="nav-icon" aria-hidden="true"></span>` across all pages
- Case study hero body paragraphs: `cs2-body` div with `display: flex; flex-direction: column; gap: 24px`
- Figma asset images expire after 7 days — always download to `assets/images/` immediately
- Nav autoscroll on homepage uses `window._scrollTarget` + `scrollIntoView` on load

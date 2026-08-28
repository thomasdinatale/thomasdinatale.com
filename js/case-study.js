(function () {
  /* Click-ball effect — PAUSED in favor of the cursor grid-glow. Flip to true
     to bring the bouncing ember dots back. */
  var ENABLE_CLICK_BALLS = false;
  if (!ENABLE_CLICK_BALLS) return;

  var GRAVITY = 2600;      // px/s^2
  var RESTITUTION = 0.6;   // energy kept after the bounce
  var RADIUS = 5;          // 10px circle

  function barY() {
    var nav = document.getElementById('nav');
    return (nav ? nav.getBoundingClientRect().bottom : 0) + RADIUS;
  }

  document.addEventListener('click', function (e) {
    if (e.target.closest('a, button, input, textarea, select, label')) return;

    var dot = document.createElement('div');
    dot.className = 'ember-dot';
    document.body.appendChild(dot);

    var x = e.clientX;
    var y = e.clientY;
    var bar = barY();
    var climb = Math.max(y - bar, 0) + 48;      // reach the nav bar with a little to spare

    var vx = (Math.random() - 0.5) * 50;
    var vy = -Math.sqrt(2 * GRAVITY * climb);   // launch upward

    var wasBelow = y > bar;
    var last = null;
    var start = null;

    function frame(t) {
      if (last === null) { last = t; start = t; }
      var dt = Math.min((t - last) / 1000, 0.032);
      last = t;

      vy += GRAVITY * dt;
      x += vx * dt;
      y += vy * dt;

      var b = barY();
      if (y > b) wasBelow = true;
      if (wasBelow && y <= b && vy < 0) {       // hit the ember nav bar
        y = b;
        vy = -vy * RESTITUTION;
        vx = (Math.random() - 0.5) * 800;       // ricochet off at a varied angle
      }

      dot.style.transform = 'translate(' + (x - RADIUS) + 'px,' + (y - RADIUS) + 'px)';

      if (y - RADIUS > window.innerHeight + 40 ||
          x < -40 || x > window.innerWidth + 40 ||
          (t - start) > 4000) {
        dot.remove();
        return;
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  });
})();

(function () {
  /* Cursor spotlight — lights up the background grid lines near the pointer.
     Creates the .grid-glow layer wherever .bg-grid exists (no per-page markup),
     then updates two CSS vars on pointermove, throttled to one rAF per frame. */
  if (!document.querySelector('.bg-grid')) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var glow = document.createElement('div');
  glow.className = 'grid-glow';
  glow.setAttribute('aria-hidden', 'true');
  document.body.appendChild(glow);

  /* The glow is a nice "activation" over empty background, but distracting
     behind written content. So hide it (0%) whenever the pointer is over a
     CONTENT leaf — text, media, or a card — and keep it over bare layout
     (section padding, gutters, the empty grid). We test the element directly
     under the cursor, not its wrapping section, so the gutters stay lit. */
  var CONTENT_SELECTOR = [
    'p', 'h1', 'h2', 'h3', 'h4', 'li', 'img', 'video',
    '.project-card', '.article-card', '.history-card', '.photo-item',
    '.cs2-problem-card', '.cs2-metric', '.cs-evolved', '.cs-meta-card', '.article-meta-card',
    '.cs2-figure', '.cs2-media', '.cs-image-block',
    '.cs2-hero-image-card', '.cs-hero-image-bg', '.cs2-hero-phones-row',
    '.projects-cta-btn', '.panel-link'
  ].join(', ');

  var x = 0, y = 0, active = false, ticking = false;

  function apply() {
    ticking = false;
    glow.style.setProperty('--gx', x + 'px');
    glow.style.setProperty('--gy', y + 'px');
    var el = document.elementFromPoint(x, y);
    glow.classList.toggle('is-over-content', !!(el && el.closest(CONTENT_SELECTOR)));
  }

  window.addEventListener('pointermove', function (e) {
    if (e.pointerType && e.pointerType !== 'mouse') return;
    x = e.clientX;
    y = e.clientY;
    if (!active) { active = true; glow.classList.add('is-active'); }
    if (!ticking) { ticking = true; requestAnimationFrame(apply); }
  }, { passive: true });

  document.addEventListener('mouseleave', function () {
    active = false;
    glow.classList.remove('is-active');
  });
})();

(function () {
  /* Nav circle: single-click toggles between light and extra-dark (the two
     user-facing themes). Standard 'dark' still exists in CSS but isn't reachable
     here. Overrides OS preference and persists. */
  var root = document.documentElement;

  function setTheme(name) {
    var c = root.classList;
    c.remove('theme-light', 'theme-dark', 'theme-extra-dark');
    c.add('theme-' + name);
    try { localStorage.setItem('td-theme', name); } catch (err) {}
  }

  function currentTheme() {
    var c = root.classList;
    if (c.contains('theme-extra-dark')) return 'extra-dark';
    if (c.contains('theme-light')) return 'light';
    if (c.contains('theme-dark')) return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'extra-dark' : 'light';
  }

  document.addEventListener('click', function (e) {
    if (!e.target.closest || !e.target.closest('.theme-toggle')) return;
    /* Anything that isn't light (extra-dark, or a legacy 'dark') flips to light. */
    setTheme(currentTheme() === 'light' ? 'extra-dark' : 'light');
  });
})();

(function () {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -10% 0px' }
  );

  document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));
})();

/* Nav email: hover shows the address in a tooltip; click copies it to the
   clipboard and the tooltip reads "Copied!" for 3 seconds. */
(function () {
  var EMAIL = 'hi@thomasdinatale.com';
  var mail = document.querySelector('.nav-mail');
  if (!mail) return;

  var tip = document.createElement('span');
  tip.className = 'tooltip';
  tip.textContent = EMAIL;
  tip.setAttribute('aria-hidden', 'true');
  mail.appendChild(tip);
  mail.setAttribute('aria-label', 'Copy email address ' + EMAIL);

  // Offscreen live region so the copy confirmation is announced.
  var live = document.createElement('span');
  live.setAttribute('aria-live', 'polite');
  live.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;';
  mail.appendChild(live);

  var timer = null;

  function confirmCopied() {
    tip.textContent = 'Copied!';
    tip.classList.add('is-visible');
    live.textContent = 'Email address copied to clipboard';
    if (timer) clearTimeout(timer);
    timer = setTimeout(function () {
      tip.classList.remove('is-visible');
      tip.textContent = EMAIL;
      live.textContent = '';
    }, 3000);
  }

  function fallbackCopy() {
    try {
      var ta = document.createElement('textarea');
      ta.value = EMAIL;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:absolute;left:-9999px;';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    } catch (err) {}
    confirmCopied();
  }

  mail.addEventListener('click', function (e) {
    e.preventDefault();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(EMAIL).then(confirmCopied).catch(fallbackCopy);
    } else {
      fallbackCopy();
    }
  });
})();

/* Nav LinkedIn: simple hover tooltip. */
(function () {
  var link = document.querySelector('.nav-icon-link[href*="linkedin"]');
  if (!link) return;
  var tip = document.createElement('span');
  tip.className = 'tooltip';
  tip.textContent = 'LinkedIn';
  tip.setAttribute('aria-hidden', 'true');
  link.appendChild(tip);
})();

/* Slide-out panel: open from a trigger, close via X / scrim / Esc. */
(function () {
  const panel = document.getElementById('evolved-panel');
  if (!panel) return;
  const scrim = document.querySelector('.panel-scrim');
  const trigger = document.querySelector('[data-panel-open]');
  const closeEls = document.querySelectorAll('[data-panel-close]');
  const closeBtn = panel.querySelector('.panel-close');
  const panelBody = panel.querySelector('.panel-body');
  const panelHeader = panel.querySelector('.panel-header');
  let lastFocused = null;

  // Header mirrors the nav: color + 1px shale bottom border once the body scrolls
  if (panelBody && panelHeader) {
    panelBody.addEventListener('scroll', function () {
      panelHeader.classList.toggle('scrolled', panelBody.scrollTop > 0);
    }, { passive: true });
  }

  function isOpen() {
    return panel.classList.contains('is-open');
  }
  function openPanel() {
    lastFocused = document.activeElement;
    if (panelBody) panelBody.scrollTop = 0;
    if (panelHeader) panelHeader.classList.remove('scrolled');
    panel.classList.add('is-open');
    if (scrim) scrim.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('panel-open');
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    if (closeBtn) closeBtn.focus();
  }
  function closePanel() {
    panel.classList.remove('is-open');
    if (scrim) scrim.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('panel-open');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  if (trigger) trigger.addEventListener('click', openPanel);
  closeEls.forEach((el) => el.addEventListener('click', closePanel));

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen()) closePanel();
  });

  // Keep Tab focus within the panel while it's open
  panel.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab' || !isOpen()) return;
    const f = panel.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
})();

/* Global site nav — top-sheet panel, hamburger⇄X toggle, hover-bound circle
   graphic. The header (#nav) stays mounted above the panel; only #nav-panel
   transforms. */
(function () {
  const panel = document.getElementById('nav-panel');
  if (!panel) return;
  const root = document.documentElement;
  const header = document.getElementById('nav');
  const toggle = document.querySelector('[data-nav-toggle]');
  const scrim = document.querySelector('.nav-scrim');
  const closeEls = document.querySelectorAll('[data-nav-close]');
  const menuLinks = panel.querySelectorAll('.nav-panel-item');
  const modeBtn = panel.querySelector('[data-nav-mode]');
  const modeLabel = panel.querySelector('[data-nav-mode-label]');
  const graphic = panel.querySelector('[data-nav-graphic]');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  let lastFocused = null;

  // Publish header height so the panel can pad its content clear of the header.
  function setHeaderHeight() {
    if (header) root.style.setProperty('--nav-height', header.offsetHeight + 'px');
  }
  setHeaderHeight();
  window.addEventListener('resize', setHeaderHeight, { passive: true });

  // Everything outside the header + panel is made inert while the panel is open.
  const pageEls = Array.prototype.filter.call(document.body.children, function (el) {
    return el !== panel && el !== scrim && el !== header &&
      el.tagName !== 'SCRIPT' &&
      !el.classList.contains('bg-grid') && !el.classList.contains('bg-top-fade');
  });
  function setInert(on) {
    pageEls.forEach(function (el) {
      if (on) { el.setAttribute('inert', ''); el.setAttribute('aria-hidden', 'true'); }
      else { el.removeAttribute('inert'); el.removeAttribute('aria-hidden'); }
    });
  }

  function isOpen() { return panel.classList.contains('is-open'); }

  function openPanel() {
    lastFocused = document.activeElement;
    panel.classList.add('is-open');
    if (scrim) scrim.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    if (toggle) toggle.setAttribute('aria-expanded', 'true');
    root.classList.add('nav-open');
    // Vercel Web Analytics custom event: count how often the nav menu is opened.
    // Guarded so pages without the insights script (or blocked analytics) no-op.
    if (typeof window.va === 'function') window.va('event', { name: 'nav_open' });
    setInert(true);
    // Focus the dialog container itself (not the first menu item) so no item shows
    // a focus ring on open; the Tab trap below still moves focus into the items.
    panel.setAttribute('tabindex', '-1');
    panel.focus({ preventScroll: true });
  }
  function closePanel() {
    panel.classList.remove('is-open');
    if (scrim) scrim.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
    root.classList.remove('nav-open');
    setInert(false);
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus({ preventScroll: true });
  }

  if (toggle) toggle.addEventListener('click', function () { isOpen() ? closePanel() : openPanel(); });
  closeEls.forEach(function (el) { el.addEventListener('click', closePanel); });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen()) { closePanel(); if (toggle) toggle.focus(); }
  });

  // Trap Tab focus within the panel while it is open
  panel.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab' || !isOpen()) return;
    const f = panel.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  // Menu links are still same-page hash links to homepage sections. While that's
  // true, close the panel first and scroll on the panel's transitionend so the two
  // motions don't run at once. Remove this block once items point at real pages.
  menuLinks.forEach(function (a) {
    a.addEventListener('click', function (e) {
      const href = a.getAttribute('href');
      if (href && href.charAt(0) === '#') {
        e.preventDefault();
        const target = document.querySelector(href);
        const go = function () {
          if (target) target.scrollIntoView({ behavior: reduce.matches ? 'auto' : 'smooth', block: 'start' });
          try { history.replaceState(null, '', href); } catch (_) {}
        };
        const onEnd = function (ev) {
          if (ev.target === panel && ev.propertyName === 'transform') {
            panel.removeEventListener('transitionend', onEnd);
            go();
          }
        };
        panel.addEventListener('transitionend', onEnd);
        closePanel();
        if (reduce.matches) { panel.removeEventListener('transitionend', onEnd); go(); }
        // Safety net if transitionend never fires
        setTimeout(function () { panel.removeEventListener('transitionend', onEnd); }, 500);
      } else {
        closePanel(); // cross-page navigation proceeds on its own
      }
    });
  });

  // Light ⇄ extra-dark toggle, label kept in sync
  function currentTheme() {
    const c = root.classList;
    if (c.contains('theme-extra-dark')) return 'extra-dark';
    if (c.contains('theme-light')) return 'light';
    if (c.contains('theme-dark')) return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'extra-dark' : 'light';
  }
  function syncModeLabel() {
    if (modeLabel) modeLabel.textContent = currentTheme() === 'light' ? 'Turn the lights off' : 'Turn the lights on';
  }
  if (modeBtn) {
    modeBtn.addEventListener('click', function () {
      const next = currentTheme() === 'light' ? 'extra-dark' : 'light';
      const c = root.classList;
      c.remove('theme-light', 'theme-dark', 'theme-extra-dark');
      c.add('theme-' + next);
      try { localStorage.setItem('td-theme', next); } catch (_) {}
      syncModeLabel();
    });
    syncModeLabel();
  }

  /* ── Circle graphic engine ──────────────────────────────────────────────
     Tween r/cx/cy directly in a requestAnimationFrame loop. CSS transitions on
     geometry attributes are Chrome/Safari-only, so rAF makes it behave the same
     everywhere and lets the exact cubic-bezier apply. Fills transition via CSS. */
  if (graphic) {
    const svg = graphic.querySelector('svg');
    const ids = ['Lo', 'Lc', 'Lm', 'Ro', 'Rc', 'Rm', 'X', 'Lx'];
    const els = {};
    ids.forEach(function (k) { els[k] = svg.querySelector('.' + k); });

    // Exact geometry from the Figma SVGs, unified into a common 720×450 viewBox
    // (rest/about artboards +0,+25y; work/writing artboards +63x). L = lower-cx
    // form, R = higher-cx form. X is the small dot in About's right circle; Lx is
    // the ember accent in About's left circle (r0 in every other state).
    const STATES = {
      rest:    { Lo: [200, 225, 196],       Lc: [200, 225, 111.5],           Lm: [199, 224, 50],           Ro: [520, 225, 196],       Rc: [519.5, 224.5, 111.5],       Rm: [519, 224, 30],           X: [520, 225, 0],    Lx: [200, 224, 0] },
      work:    { Lo: [203, 225.689, 136],   Lc: [202.651, 225.34, 77.55],    Lm: [202.3, 224.989, 34.5],   Ro: [432, 225, 221],       Rc: [431.438, 224.438, 124.938], Rm: [430.875, 223.875, 55.75], X: [520, 225, 0],    Lx: [200, 224, 0] },
      writing: { Lo: [288, 225, 221],       Lc: [287.438, 224.438, 124.938], Lm: [286.875, 223.875, 55.75],Ro: [517, 225.689, 136],   Rc: [516.651, 225.34, 77.55],    Rm: [516.3, 224.989, 34.5],   X: [520, 225, 0],    Lx: [200, 224, 0] },
      about:   { Lo: [200, 225, 196],       Lc: [200, 225, 149.5],           Lm: [200, 225, 89.5],         Ro: [520, 225, 196],       Rc: [519.5, 224.5, 148],         Rm: [520, 225, 99.5],         X: [520, 225, 19.5], Lx: [200, 224, 53.5] }
    };

    // cubic-bezier(0.16, 1, 0.3, 1) — solve x(u)=t then return y(u)
    function bez(u, a, b) { const v = 1 - u; return 3 * v * v * u * a + 3 * v * u * u * b + u * u * u; }
    function dbez(u, a, b) { const v = 1 - u; return 3 * v * v * a + 6 * v * u * (b - a) + 3 * u * u * (1 - b); }
    function easeXY(t) {
      let u = t;
      for (let i = 0; i < 5; i++) { const x = bez(u, 0.16, 0.3); const d = dbez(u, 0.16, 0.3) || 1e-6; u -= (x - t) / d; u = Math.min(1, Math.max(0, u)); }
      return bez(u, 1, 1);
    }

    const DUR = 420;
    let raf = null, startT = 0, from = null, to = null;
    function snapshot() { const s = {}; ids.forEach(function (k) { const e = els[k]; if (!e) return; s[k] = [+e.getAttribute('cx'), +e.getAttribute('cy'), +e.getAttribute('r')]; }); return s; }
    function apply(vals) { ids.forEach(function (k) { const e = els[k], v = vals[k]; if (!e || !v) return; e.setAttribute('cx', v[0]); e.setAttribute('cy', v[1]); e.setAttribute('r', Math.max(0, v[2])); }); }
    function tick(now) {
      if (!startT) startT = now;
      const p = Math.min(1, (now - startT) / DUR);
      const e = easeXY(p);
      const cur = {};
      ids.forEach(function (k) { cur[k] = [from[k][0] + (to[k][0] - from[k][0]) * e, from[k][1] + (to[k][1] - from[k][1]) * e, from[k][2] + (to[k][2] - from[k][2]) * e]; });
      apply(cur);
      raf = p < 1 ? requestAnimationFrame(tick) : null;
    }
    function goTo(name) {
      const target = STATES[name] || STATES.rest;
      graphic.dataset.state = name;
      if (reduce.matches) { apply(target); return; }
      if (raf) cancelAnimationFrame(raf);
      from = snapshot(); to = target; startT = 0;
      raf = requestAnimationFrame(tick);
    }
    graphic.dataset.state = 'rest';

    // Hover only — touch devices keep the rest composition and nothing else.
    if (window.matchMedia('(hover: hover)').matches) {
      menuLinks.forEach(function (a) {
        const name = a.getAttribute('data-nav-circle');
        if (!name) return;
        a.addEventListener('mouseenter', function () { goTo(name); });
        a.addEventListener('mouseleave', function () { goTo('rest'); });
      });
    }
  }
})();

/* ─────────────────────────────────────────
   Photo note — inline term reveals a captioned photo
   ─────────────────────────────────────────
   CSS does the showing (hover, focus-visible, .is-open). This only handles the
   two things CSS can't: keeping the card inside the viewport, and tap-to-toggle
   on touch, where there is no hover to reveal it. */
(function () {
  const notes = document.querySelectorAll('.photo-note');
  if (!notes.length) return;

  const EDGE = 16;   // minimum gap to the viewport edge
  const GAP  = 12;   // matches the 12px offset in the CSS

  function place(note) {
    const card = note.querySelector('.photo-note-card');
    const trigger = note.querySelector('.photo-note-trigger');
    if (!card || !trigger) return;

    // Measure with no shift applied, or the previous nudge compounds.
    card.style.setProperty('--pn-shift', '0px');
    card.removeAttribute('data-pn-below');

    const c = card.getBoundingClientRect();
    const t = trigger.getBoundingClientRect();

    // Horizontal: nudge back inside whichever edge it crosses. If the card is
    // wider than the viewport it can't satisfy both, so favour the left edge.
    let shift = 0;
    if (c.left < EDGE) shift = EDGE - c.left;
    else if (c.right > window.innerWidth - EDGE) shift = (window.innerWidth - EDGE) - c.right;
    if (c.width + EDGE * 2 > window.innerWidth) shift = EDGE - c.left;
    card.style.setProperty('--pn-shift', Math.round(shift) + 'px');

    // Vertical: flip below when there isn't room above but there is below.
    const roomAbove = t.top - GAP;
    const roomBelow = window.innerHeight - t.bottom - GAP;
    if (roomAbove < c.height && roomBelow > roomAbove) card.setAttribute('data-pn-below', '');
  }

  function close(note) {
    note.classList.remove('is-open');
    const trigger = note.querySelector('.photo-note-trigger');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  }

  function closeAll(except) {
    notes.forEach(function (n) { if (n !== except) close(n); });
  }

  notes.forEach(function (note) {
    const trigger = note.querySelector('.photo-note-trigger');
    if (!trigger) return;

    // Position before it becomes visible, so it never paints in the wrong spot.
    note.addEventListener('mouseenter', function () { place(note); });
    trigger.addEventListener('focus', function () { place(note); });

    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      const open = note.classList.contains('is-open');
      closeAll(note);
      if (open) { close(note); return; }
      place(note);
      note.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
    });
  });

  document.addEventListener('click', function () { closeAll(null); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAll(null);
  });
  window.addEventListener('resize', function () {
    notes.forEach(function (n) { if (n.classList.contains('is-open')) place(n); });
  }, { passive: true });
})();

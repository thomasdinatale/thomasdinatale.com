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

  var x = 0, y = 0, active = false, ticking = false;

  function apply() {
    ticking = false;
    glow.style.setProperty('--gx', x + 'px');
    glow.style.setProperty('--gy', y + 'px');
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

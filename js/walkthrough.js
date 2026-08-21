/* ─────────────────────────────────────────
   Walkthrough controller

   One page, many screens. Only .is-active is displayed. The step lives in the
   URL as ?step=N so any screen is shareable and the browser's own back/forward
   buttons walk the deck. No build step, no dependencies.
───────────────────────────────────────── */

(function () {
  var root = document.querySelector('[data-walkthrough]');
  if (!root) return;

  var screens = Array.prototype.slice.call(root.querySelectorAll('.wt-screen'));
  if (!screens.length) return;

  var total = screens.length;
  var fill = document.querySelector('[data-wt-fill]');
  var bar = document.querySelector('[data-wt-progress]');
  var prevBtn = document.querySelector('[data-wt-prev]');
  var nextBtn = document.querySelector('[data-wt-next]');
  // Decks that keep their title in fixed chrome rather than inside each screen
  // (the Nara deck) mark the element; the Primer deck has no such element.
  var titleEl = document.querySelector('[data-wt-title]');
  var deck = root.dataset.walkthrough || 'Primer walkthrough';
  // Opt-in: measure progress as steps *taken* rather than steps shown, so a
  // deck whose first screen is a title slide starts with an empty rule and the
  // fill first appears on screen 2. Primer, which opens on content, doesn't
  // set this and keeps the step/total reading.
  var progressFromZero = !!(bar && bar.hasAttribute('data-wt-progress-from-zero'));
  var reduceMotion = !!(window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var current = 0;

  if (bar) bar.setAttribute('aria-valuemax', String(total));

  /* ── Slide scaling ──────────────────────────────────────────────────────
     Opt-in via data-wt-slide="1440x816". The deck's screens are drawn once at
     that size and scaled to fit, so every screen stays proportionally
     identical to its comp at any window size instead of being pinned at comp
     size with dead space around it. CSS reads the result as --nw-scale.

     This can't be pure CSS: transform: scale() needs a unitless ratio, and
     calc() can't divide one length by another to produce one. Decks without
     the attribute (Primer, ButcherBox) never enter this path.
  ───────────────────────────────────────── */
  var slideSize = (root.dataset.wtSlide || '').split('x').map(Number);
  var scales = slideSize.length === 2 && slideSize[0] > 0 && slideSize[1] > 0;

  function fitSlide() {
    if (!scales) return;
    var host = screens[(current || 1) - 1];
    if (!host) return;
    var box = host.getBoundingClientRect();
    if (!box.width || !box.height) return;
    // Below the stacking breakpoint the CSS drops the transform entirely, so
    // the value written here is simply unused rather than wrong.
    root.style.setProperty(
      '--nw-scale',
      String(Math.min(box.width / slideSize[0], box.height / slideSize[1]))
    );
  }

  if (scales) {
    window.addEventListener('resize', fitSlide);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', fitSlide);
    }
  }

  function stepFromUrl() {
    var raw = new URLSearchParams(window.location.search).get('step');
    var n = parseInt(raw, 10);
    if (isNaN(n)) return 1;
    return Math.min(Math.max(n, 1), total);
  }

  function render(step, opts) {
    opts = opts || {};
    step = Math.min(Math.max(step, 1), total);
    if (step === current) return;
    current = step;

    screens.forEach(function (screen, i) {
      var active = i === step - 1;
      screen.classList.toggle('is-active', active);
      screen.setAttribute('aria-hidden', active ? 'false' : 'true');
    });

    // The newly active screen is the one that now has a measurable box.
    fitSlide();

    if (fill) {
      var progressed = progressFromZero
        ? (total > 1 ? (step - 1) / (total - 1) : 1)
        : step / total;
      fill.style.width = progressed * 100 + '%';
    }
    if (bar) {
      bar.setAttribute('aria-valuenow', String(step));
      bar.setAttribute('aria-valuetext', 'Screen ' + step + ' of ' + total);
    }
    if (prevBtn) prevBtn.disabled = step === 1;
    if (nextBtn) nextBtn.disabled = step === total;

    var screenTitle = screens[step - 1].dataset.title || '';
    // Optional lead-in on the band title — "Research:", "Redesign:" — which the
    // ButcherBox comps set in ember while the rest of the line stays pitch. It
    // is a separate attribute rather than markup inside data-title so this stays
    // a textContent write and never parses HTML. Decks without it (Nara) take
    // the same path they always did.
    var screenPrefix = screens[step - 1].dataset.titlePrefix || '';
    var fullTitle = screenPrefix ? screenPrefix + ' ' + screenTitle : screenTitle;
    if (titleEl) {
      titleEl.textContent = '';
      if (screenPrefix) {
        var prefixEl = document.createElement('span');
        prefixEl.className = 'wt-title-prefix';
        prefixEl.textContent = screenPrefix + ' ';
        titleEl.appendChild(prefixEl);
      }
      // Guarded: a screen with no title at all must leave the element with no
      // children, because the Nara deck keys its screen-01 brand off :empty.
      if (screenTitle) titleEl.appendChild(document.createTextNode(screenTitle));
      // The screen itself fades in via CSS, but the title is fixed chrome that
      // never re-renders — so it would hard-cut while everything else eased.
      // Matched here rather than in CSS: a text swap alone can't restart a
      // keyframe animation. No fill, so if this is skipped the title just shows.
      if (!reduceMotion && titleEl.animate) {
        titleEl.animate(
          [{ opacity: 0 }, { opacity: 1 }],
          { duration: 340, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
        );
      }
    }
    document.title = fullTitle ? fullTitle + ' — ' + deck : deck;

    if (!opts.silent) {
      var url = step === 1 ? window.location.pathname : window.location.pathname + '?step=' + step;
      history.pushState({ step: step }, '', url);
    }
    // styles.css sets scroll-behavior: smooth globally; a screen change should
    // jump, not glide down the length of a 2700px screen.
    if (!opts.keepScroll) window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function go(delta) {
    render(current + delta);
  }

  if (prevBtn) prevBtn.addEventListener('click', function () { go(-1); });
  if (nextBtn) nextBtn.addEventListener('click', function () { go(1); });

  /* ── Keyboard ───────────────────────────────────────────────────────────
     Arrows, plus the keys a presenter remote actually sends (PageDown/PageUp)
     and the ones people reach for out of habit (Space, Shift+Space, Home/End).
     Space is the awkward one: after clicking Next the button still holds focus,
     and Space on a focused button fires its click — so a bare Space would
     advance twice. Interactive targets are skipped for that reason, which also
     leaves the arrow buttons keyboard-operable in the normal way.
  ───────────────────────────────────────── */
  var INTERACTIVE = { input: 1, textarea: 1, select: 1, button: 1, a: 1 };

  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var tag = (e.target.tagName || '').toLowerCase();
    if (INTERACTIVE[tag] || e.target.isContentEditable) return;

    var key = e.key;
    // 'Spacebar' is the legacy key name; e.code is the belt-and-braces read for
    // anything that reports the key itself oddly.
    var space = key === ' ' || key === 'Spacebar' || e.code === 'Space';

    if (key === 'ArrowRight' || key === 'PageDown' || (space && !e.shiftKey)) {
      e.preventDefault();
      go(1);
    } else if (key === 'ArrowLeft' || key === 'PageUp' || (space && e.shiftKey)) {
      e.preventDefault();
      go(-1);
    } else if (key === 'Home') {
      e.preventDefault();
      render(1);
    } else if (key === 'End') {
      e.preventDefault();
      render(total);
    }
  });

  window.addEventListener('popstate', function (e) {
    var step = (e.state && e.state.step) || stepFromUrl();
    render(step, { silent: true });
  });

  // Screen media autoplays; honour a reduced-motion preference by holding on
  // the poster frame instead.
  if (reduceMotion) {
    Array.prototype.forEach.call(root.querySelectorAll('video[autoplay]'), function (v) {
      v.autoplay = false;
      v.removeAttribute('autoplay');
      v.pause();
    });
  }

  // Initial paint: honour ?step= without pushing a duplicate history entry.
  var start = stepFromUrl();
  current = 0;
  render(start, { silent: true, keepScroll: true });
  history.replaceState({ step: start }, '', window.location.href);
})();

(function () {
  var sections = document.querySelectorAll('.article-section[id]');
  var list = document.querySelector('.article-sections-list');
  var indicator = document.querySelector('.article-toc-indicator');
  if (!sections.length || !list) return;

  var lis = Array.prototype.slice.call(list.querySelectorAll('li'));
  var linkMap = {};
  lis.forEach(function (li) {
    var a = li.querySelector('a');
    if (a) linkMap[a.getAttribute('href').replace('#', '')] = li;
  });

  var activeLi = null;
  var ticking = false;

  function railBottom() {
    var last = lis[lis.length - 1];
    return last ? last.offsetTop + last.offsetHeight : list.offsetHeight;
  }

  function clamp01(v) {
    return v < 0 ? 0 : v > 1 ? 1 : v;
  }

  function update() {
    ticking = false;
    var navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 72;
    var threshold = navHeight + 40;

    // Active section = the last one whose top has passed the threshold.
    var activeIndex = -1;
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].getBoundingClientRect().top <= threshold) activeIndex = i;
    }

    // Sync the active title highlight.
    var newActiveLi = activeIndex >= 0 ? linkMap[sections[activeIndex].id] || null : null;
    if (newActiveLi !== activeLi) {
      if (activeLi) activeLi.classList.remove('active');
      activeLi = newActiveLi;
      if (activeLi) activeLi.classList.add('active');
    }

    // Above the first section: nothing lit, no fill.
    if (activeIndex < 0 || !activeLi) {
      indicator.style.opacity = '0';
      indicator.style.height = '0px';
      return;
    }

    // Progress through the current section (0 → 1) as it scrolls past the
    // threshold toward the next section (or its own bottom for the last one).
    var sec = sections[activeIndex];
    var next = sections[activeIndex + 1];
    var top = sec.getBoundingClientRect().top;
    var end = next ? next.getBoundingClientRect().top : sec.getBoundingClientRect().bottom;
    var p = clamp01((threshold - top) / Math.max(end - top, 1));

    // Map that onto the rail: the ember head travels from this title's row toward
    // the next title's row, so the fill grows smoothly instead of snapping.
    var headStart = activeLi.offsetTop;
    var nextLi = lis[lis.indexOf(activeLi) + 1];
    var headEnd = nextLi ? nextLi.offsetTop : railBottom();
    var head = headStart + p * (headEnd - headStart);

    // The last section's bottom can't reach the threshold (the page ends first),
    // so fill to the full rail once the reader hits the bottom of the page.
    var atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    if (atBottom) head = railBottom();

    indicator.style.opacity = '1';
    indicator.style.height = head + 'px';
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
})();

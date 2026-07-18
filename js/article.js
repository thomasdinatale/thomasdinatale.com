(function () {
  var sections = document.querySelectorAll('.article-section[id]');
  var list = document.querySelector('.article-sections-list');
  var indicator = document.querySelector('.article-toc-indicator');
  if (!sections.length || !list) return;

  var linkMap = {};
  list.querySelectorAll('li').forEach(function (li) {
    var a = li.querySelector('a');
    if (a) linkMap[a.getAttribute('href').replace('#', '')] = li;
  });

  var activeLi = null;

  function moveIndicator() {
    if (activeLi && indicator) {
      indicator.style.transform = 'translateY(' + activeLi.offsetTop + 'px)';
    }
  }

  function setActive(id) {
    var li = id ? linkMap[id] : null;
    if (li === activeLi) return;
    if (activeLi) activeLi.classList.remove('active');
    activeLi = li;
    if (!li) {
      // No section in focus (e.g. above the first one): hide the ember bar.
      if (indicator) indicator.style.opacity = '0';
      return;
    }
    li.classList.add('active');
    if (indicator) {
      indicator.style.opacity = '1'; // fade in on first focus
      moveIndicator();               // slide to the section in focus
    }
  }

  function updateActive() {
    var navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 72;
    var threshold = navHeight + 40;
    var activeId = null;
    sections.forEach(function (section) {
      if (section.getBoundingClientRect().top <= threshold) activeId = section.id;
    });
    setActive(activeId);
  }

  updateActive();
  window.addEventListener('scroll', updateActive, { passive: true });
  window.addEventListener('resize', moveIndicator, { passive: true });
})();

(function () {
  var sections = document.querySelectorAll('.article-section[id]');
  var tocLinks = document.querySelectorAll('.article-sections-list a');
  if (!sections.length || !tocLinks.length) return;

  var linkMap = {};
  tocLinks.forEach(function (link) {
    var id = link.getAttribute('href').replace('#', '');
    linkMap[id] = link;
  });

  function setActive(id) {
    document.querySelectorAll('.article-sections-list li').forEach(function (li) {
      li.classList.remove('active');
    });
    if (id && linkMap[id]) {
      linkMap[id].closest('li').classList.add('active');
    }
  }

  function updateActive() {
    var navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 72;
    var threshold = navHeight + 40;
    var activeId = null;
    sections.forEach(function (section) {
      if (section.getBoundingClientRect().top <= threshold) {
        activeId = section.id;
      }
    });
    setActive(activeId);
  }

  // Measure each li at bold weight and lock in that height so
  // switching between regular and semibold never shifts other items.
  function reserveBoldHeight() {
    var lis = document.querySelectorAll('.article-sections-list li');
    lis.forEach(function (li) {
      var a = li.querySelector('a');
      if (!a) return;
      li.style.minHeight = '';
      li.classList.add('active');
      li.style.minHeight = li.offsetHeight + 'px';
      li.classList.remove('active');
    });
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      reserveBoldHeight();
      updateActive();
    });
  } else {
    reserveBoldHeight();
    updateActive();
  }

  window.addEventListener('scroll', updateActive, { passive: true });
})();

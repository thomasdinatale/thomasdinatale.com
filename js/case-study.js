(function () {
  document.addEventListener('click', function (e) {
    if (e.target.closest('a, button, input, textarea, select, label')) return;
    var sq = document.createElement('div');
    sq.className = 'ember-square';
    sq.style.left = (e.clientX - 5) + 'px';
    sq.style.top  = (e.clientY - 5) + 'px';
    document.body.appendChild(sq);
    sq.addEventListener('animationend', function () { sq.remove(); });
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

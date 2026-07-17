(function () {
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

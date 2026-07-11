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
  /* Nav toggle: switch light/dark (overrides OS, persists) */
  document.addEventListener('click', function (e) {
    if (!e.target.closest || !e.target.closest('.theme-toggle')) return;
    var c = document.documentElement.classList;
    var dark = c.contains('theme-dark') ? true
      : c.contains('theme-light') ? false
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
    var goDark = !dark;
    c.remove('theme-dark', 'theme-light');
    c.add(goDark ? 'theme-dark' : 'theme-light');
    try { localStorage.setItem('td-theme', goDark ? 'dark' : 'light'); } catch (err) {}
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

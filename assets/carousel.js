// Feature carousel, paged: 1 slide per page on phones, 2 on tablets, 3 on desktop (set in CSS via --per).
// Native scroll-snap for touch; arrows, dots (one per page), chips and arrow keys on top. No autoplay.
(function () {
  var root = document.querySelector('.carousel');
  if (!root) return;
  var track = root.querySelector('.car-track');
  var slides = Array.prototype.slice.call(track.querySelectorAll('.slide'));
  var prev = root.querySelector('.car-prev');
  var next = root.querySelector('.car-next');
  var dotsBox = root.querySelector('.car-dots');
  var status = document.getElementById('car-status');
  var chips = Array.prototype.slice.call(document.querySelectorAll('.car-chips button'));
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var N = slides.length;
  var per = 1;       // slides per page
  var first = 0;     // index of the first visible slide
  var dots = [];

  function title(i) { return slides[i].querySelector('h3').textContent; }
  function readPer() { return Math.max(1, parseInt(getComputedStyle(root).getPropertyValue('--per'), 10) || 1); }
  function lastFirst() { return Math.max(0, N - per); }
  function pages() { return Math.ceil(N / per); }
  function pageStart(p) { return Math.min(p * per, lastFirst()); }
  function pageOf(i) { return i >= lastFirst() ? pages() - 1 : Math.round(i / per); }
  function pad() { return parseFloat(getComputedStyle(track).scrollPaddingLeft) || 0; }

  function buildDots() {
    dotsBox.textContent = '';
    dots = [];
    for (var p = 0; p < pages(); p++) {
      var s = pageStart(p), e = Math.min(N, s + per);
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', per === 1 ? title(s) : 'Slides ' + (s + 1) + ' to ' + e);
      b.addEventListener('click', (function (s) { return function () { go(s, true); }; })(s));
      dotsBox.appendChild(b);
      dots.push(b);
    }
  }

  function go(i, announce) {
    i = Math.max(0, Math.min(lastFirst(), i));
    track.scrollTo({ left: slides[i].offsetLeft - pad(), behavior: reduce.matches ? 'auto' : 'smooth' });
    setFirst(i);
    if (announce) {
      var e = Math.min(N, i + per);
      var names = [];
      for (var k = i; k < e; k++) names.push(title(k));
      status.textContent = (per === 1 ? 'Slide ' + (i + 1) : 'Slides ' + (i + 1) + ' to ' + e) + ' of ' + N + ': ' + names.join(', ');
    }
  }

  function setFirst(i) {
    first = i;
    var p = pageOf(i);
    dots.forEach(function (d, k) { d.setAttribute('aria-current', k === p ? 'true' : 'false'); });
    var group = slides[i].getAttribute('data-group');
    chips.forEach(function (c) { c.setAttribute('aria-pressed', c.getAttribute('data-jump') === group ? 'true' : 'false'); });
    prev.disabled = i <= 0;
    next.disabled = i >= lastFirst();
  }

  function nearest() {
    var x = track.scrollLeft + pad(), best = 0, dist = Infinity;
    slides.forEach(function (s, k) {
      var d = Math.abs(s.offsetLeft - x);
      if (d < dist) { dist = d; best = k; }
    });
    return Math.min(best, lastFirst());
  }

  var ticking = false;
  track.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var i = nearest();
      if (i !== first) setFirst(i);
    });
  }, { passive: true });

  prev.addEventListener('click', function () { go(first - per, true); });
  next.addEventListener('click', function () { go(first + per, true); });

  track.addEventListener('keydown', function (e) {
    var map = { ArrowRight: first + per, ArrowLeft: first - per, Home: 0, End: lastFirst() };
    if (!(e.key in map)) return;
    e.preventDefault();
    go(map[e.key], true);
  });

  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      var g = c.getAttribute('data-jump');
      for (var k = 0; k < N; k++) {
        if (slides[k].getAttribute('data-group') === g) { go(k, true); break; }
      }
    });
  });

  function layout() {
    var p = readPer();
    if (p === per && dots.length) return;
    per = p;
    buildDots();
    go(Math.min(first, lastFirst()), false);
  }
  var rt;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(layout, 120); });
  layout();
})();

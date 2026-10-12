// Feature carousel: native scroll-snap for touch; arrows, dots, chips and arrow keys on top. No autoplay.
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
  var current = 0;

  function title(i) { return slides[i].querySelector('h3').textContent; }

  var dots = slides.map(function (s, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', title(i));
    b.addEventListener('click', function () { go(i, true); });
    dotsBox.appendChild(b);
    return b;
  });

  function edge() { return parseFloat(getComputedStyle(track).paddingLeft) || 0; }
  function maxScroll() { return track.scrollWidth - track.clientWidth; }

  function go(i, announce) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    var left = Math.min(slides[i].offsetLeft - edge(), maxScroll());
    track.scrollTo({ left: left, behavior: reduce.matches ? 'auto' : 'smooth' });
    setCurrent(i);
    if (announce) status.textContent = 'Slide ' + (i + 1) + ' of ' + slides.length + ': ' + title(i);
  }

  function setCurrent(i) {
    current = i;
    dots.forEach(function (d, k) { d.setAttribute('aria-current', k === i ? 'true' : 'false'); });
    var group = slides[i].getAttribute('data-group');
    chips.forEach(function (c) { c.setAttribute('aria-pressed', c.getAttribute('data-jump') === group ? 'true' : 'false'); });
    prev.disabled = i === 0;
    next.disabled = i === slides.length - 1;
  }

  function nearest() {
    var x = track.scrollLeft + edge(), best = 0, dist = Infinity;
    slides.forEach(function (s, k) {
      var d = Math.abs(s.offsetLeft - x);
      if (d < dist) { dist = d; best = k; }
    });
    return best;
  }

  var ticking = false;
  track.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      // At the far end the last few slides can't reach the start edge: keep a slide picked
      // there with a dot or arrow, otherwise mark the last one.
      var n = nearest();
      var i = track.scrollLeft >= maxScroll() - 2 ? (current >= n ? current : slides.length - 1) : n;
      if (i !== current) setCurrent(i);
    });
  }, { passive: true });

  prev.addEventListener('click', function () { go(current - 1, true); });
  next.addEventListener('click', function () { go(current + 1, true); });

  track.addEventListener('keydown', function (e) {
    var map = { ArrowRight: current + 1, ArrowLeft: current - 1, Home: 0, End: slides.length - 1 };
    if (!(e.key in map)) return;
    e.preventDefault();
    go(map[e.key], true);
  });

  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      var g = c.getAttribute('data-jump');
      for (var k = 0; k < slides.length; k++) {
        if (slides[k].getAttribute('data-group') === g) { go(k, true); break; }
      }
    });
  });

  setCurrent(0);
})();

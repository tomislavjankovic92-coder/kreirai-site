(function () {
  'use strict';
  var doc = document, root = doc.documentElement, body = doc.body;
  body.classList.remove('no-js');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s, c) { return (c || doc).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); }
  function store(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { return null; } }

  /* ---------- izbornik ---------- */
  var burger = $('#burger'), menu = $('#menu');
  if (burger) burger.addEventListener('click', function () {
    var open = !menu.classList.contains('is-open');
    menu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open);
    body.style.overflow = open ? 'hidden' : '';
    beep(open ? 660 : 440, .06);
  });
  $$('#menu a').forEach(function (a) { a.addEventListener('click', function () { menu.classList.remove('is-open'); body.style.overflow = ''; }); });

  /* ---------- zvuk (WebAudio, bez datoteka) ---------- */
  var actx = null, soundOn = store('kaiSound') === '1';
  function ac() { if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } return actx; }
  function beep(f, d, type, slide) {
    if (!soundOn) return; var c = ac(); if (!c) return;
    var o = c.createOscillator(), g = c.createGain(), t = c.currentTime;
    o.type = type || 'square'; o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + d);
    g.gain.setValueAtTime(.06, t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + d + .02);
  }
  function coin() { beep(988, .08); setTimeout(function () { beep(1319, .25); }, 80); }
  var sndBtn = $('#sndBtn');
  function paintSnd() { sndBtn.setAttribute('aria-pressed', soundOn); sndBtn.textContent = soundOn ? '🔊 Zvuk' : '🔈 Zvuk'; }
  if (sndBtn) { paintSnd(); sndBtn.addEventListener('click', function () { soundOn = !soundOn; store('kaiSound', soundOn ? '1' : '0'); paintSnd(); if (soundOn) { ac() && actx.resume && actx.resume(); coin(); } }); }
  $$('[data-snd="coin"]').forEach(function (a) { a.addEventListener('click', function () { coin(); }); });
  /* tihi "tik" pri prelasku mišem preko navigacije i gumba — samo kad je zvuk uključen */
  var lastTick = 0;
  function tick(f) { var n = Date.now(); if (n - lastTick < 60) return; lastTick = n; beep(f, .035); }
  $$('.nav__links a,.nav__logo,.nav__cta,.nav__burger,.menu a,.foot__row nav a').forEach(function (el, i) { el.addEventListener('mouseenter', function () { tick(i % 2 ? 1175 : 1047); }); });
  $$('.btn,.tv__knob,.faq summary,.win__btns a,.win__btns button,.hud button').forEach(function (el) { el.addEventListener('mouseenter', function () { tick(784); }); });

  /* ---------- bodovi i postignuća ---------- */
  var scoreEl = $('#score'), shown = 0, score = parseInt(store('kaiScore') || '0', 10) || 0;
  var achDone = {}; try { achDone = JSON.parse(store('kaiAch') || '{}') || {}; } catch (e) {}
  function pad(n) { n = String(Math.max(0, Math.min(999999, n))); return '000000'.slice(n.length) + n; }
  function tickScore() {
    if (shown === score) return;
    shown += Math.max(1, Math.ceil((score - shown) / 6));
    if (shown > score) shown = score;
    scoreEl.textContent = pad(shown);
    requestAnimationFrame(tickScore);
  }
  function addScore(n) { score += n; store('kaiScore', score); requestAnimationFrame(tickScore); }
  shown = score; if (scoreEl) scoreEl.textContent = pad(score);
  var toast = $('#toast'), toastT = $('#toastT'), toastP = $('#toastP'), toastTimer;
  function achieve(key, title, pts) {
    if (achDone[key]) return; achDone[key] = 1; store('kaiAch', JSON.stringify(achDone));
    $('#achN').textContent = Object.keys(achDone).length;
    toastT.textContent = title; toastP.textContent = '+' + pts;
    toast.classList.add('is-on'); clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('is-on'); }, 2800);
    addScore(pts); beep(523, .08); setTimeout(function () { beep(659, .08); }, 90); setTimeout(function () { beep(784, .18); }, 180);
  }
  var achN = $('#achN'); if (achN) achN.textContent = Object.keys(achDone).length;
  var hud = $('#hud'), hudMin = $('#hudMin');
  if (hudMin) hudMin.addEventListener('click', function () { var m = hud.classList.toggle('is-min'); hudMin.textContent = m ? '+' : '–'; hudMin.setAttribute('aria-label', m ? 'Prikaži traku s bodovima' : 'Sakrij traku s bodovima'); });
  addScore(0);
  window.KAI = { addScore: addScore, achieve: achieve, beep: beep };

  /* ---------- "ZVONI." — klik/hover pozvoni (zvuk ako je uključen) ---------- */
  var ringEl = $('#ring'), ringT;
  function ringtone() {
    for (var k = 0; k < 2; k++) for (var i = 0; i < 6; i++) (function (t, f) { setTimeout(function () { beep(f, .05, 'square'); }, t); })(k * 520 + i * 60, i % 2 ? 1760 : 1320);
  }
  if (ringEl) {
    ringEl.addEventListener('click', function () {
      ringEl.classList.add('is-ringing'); clearTimeout(ringT);
      ringT = setTimeout(function () { ringEl.classList.remove('is-ringing'); }, 1800);
      ringtone(); addScore(15); achieve('ring', 'Javili ste se na telefon', 300);
    });
    ringEl.addEventListener('mouseenter', function () { beep(1320, .04); });
  }
  setTimeout(function () { achieve('start', 'Igrač 1 se pridružio', 100); }, 1800);

  /* ---------- otkrivanje pri scrollu ---------- */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    $$('.rv').forEach(function (el) { io.observe(el); });
    // postignuća za sekcije
    var aio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { achieve(e.target.id, e.target.getAttribute('data-ach'), 150); aio.unobserve(e.target); } });
    }, { threshold: .35 });
    $$('[data-ach]').forEach(function (el) { aio.observe(el); });
    // razlika: animacija kvačica
    var vs = $('#vs'); if (vs) new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { vs.classList.add('in'); o.disconnect(); } }, { threshold: .3 }).observe(vs);
    // trake/marquee staju izvan ekrana
    var mio = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle('is-off', !e.isIntersecting); }); });
    $$('.tapes,.hero__side,.foot__mark').forEach(function (el) { mio.observe(el); });
  } else { $$('.rv').forEach(function (el) { el.classList.add('in'); }); }

  /* ---------- split-flap brojke ---------- */
  var CH = '0123456789€★ABCDEFGHIJKLMNOPRSTUVZ,';
  function runFlap(el) {
    var target = el.getAttribute('data-flap'), cells = [];
    el.innerHTML = '';
    for (var i = 0; i < target.length; i++) {
      var s = doc.createElement('span'); s.setAttribute('aria-hidden', 'true');
      s.textContent = target[i] === ' ' ? ' ' : CH[Math.floor(Math.random() * CH.length)];
      el.appendChild(s); cells.push(s);
    }
    if (reduce) { cells.forEach(function (c, i) { c.textContent = target[i] === ' ' ? ' ' : target[i]; }); return; }
    cells.forEach(function (c, i) {
      if (target[i] === ' ') return;
      var n = 8 + i * 4 + Math.floor(Math.random() * 4);
      (function step() {
        c.classList.remove('is-flip'); void c.offsetWidth; c.classList.add('is-flip');
        if (--n <= 0) { c.textContent = target[i]; return; }
        c.textContent = CH[Math.floor(Math.random() * CH.length)];
        setTimeout(step, 55);
      })();
    });
    beep(220, .5, 'sawtooth', 110);
  }
  if ('IntersectionObserver' in window) {
    var fio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { runFlap(e.target); fio.unobserve(e.target); } }); }, { threshold: .6 });
    $$('[data-flap]').forEach(function (el) { el.textContent = el.getAttribute('data-flap'); fio.observe(el); });
  }

  /* ---------- naljepnice koje se povlače (s inercijom) ---------- */
  var topZ = 10;
  $$('[data-stk]').forEach(function (el) {
    var x = 0, y = 0, r0 = parseFloat(getComputedStyle(el).getPropertyValue('--r')) || 0, r = r0;
    var vx = 0, vy = 0, lx = 0, ly = 0, lt = 0, drag = false, raf = 0, sx = 0, sy = 0, moved = false;
    function paint() { el.style.setProperty('--x', x + 'px'); el.style.setProperty('--y', y + 'px'); el.style.setProperty('--r', r + 'deg'); }
    function bounds() {
      var st = el.parentNode.getBoundingClientRect(), b = el.getBoundingClientRect();
      return { minX: x - (b.left - st.left) - 40, maxX: x + (st.right - b.right) + 40, minY: y - (b.top - st.top) - 80, maxY: y + (st.bottom - b.bottom) + 60 };
    }
    function glide() {
      vx *= .92; vy *= .92; x += vx; y += vy;
      var bd = bounds();
      if (x < bd.minX) { x = bd.minX; vx = -vx * .5; } if (x > bd.maxX) { x = bd.maxX; vx = -vx * .5; }
      if (y < bd.minY) { y = bd.minY; vy = -vy * .5; } if (y > bd.maxY) { y = bd.maxY; vy = -vy * .5; }
      r += (r0 + vx * .6 - r) * .15; paint();
      if (Math.abs(vx) + Math.abs(vy) > .3) raf = requestAnimationFrame(glide);
    }
    el.addEventListener('pointerdown', function (e) {
      if (e.button > 0) return;
      el.classList.remove('pop');
      drag = true; moved = false; cancelAnimationFrame(raf); el.setPointerCapture(e.pointerId);
      el.classList.add('is-drag'); el.style.zIndex = ++topZ; el.style.setProperty('--s', 1.08);
      sx = e.clientX - x; sy = e.clientY - y; lx = e.clientX; ly = e.clientY; lt = performance.now();
      beep(330, .05);
    });
    el.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var now = performance.now(), dt = Math.max(8, now - lt);
      vx = (e.clientX - lx) / dt * 16; vy = (e.clientY - ly) / dt * 16; lx = e.clientX; ly = e.clientY; lt = now;
      x = e.clientX - sx; y = e.clientY - sy; r = r0 + Math.max(-25, Math.min(25, vx * 1.6)); moved = true; paint();
    });
    function up() {
      if (!drag) return; drag = false; el.classList.remove('is-drag'); el.style.setProperty('--s', 1);
      if (moved) { addScore(10); if (!el._got) { el._got = 1; if ($$('[data-stk]').every(function (s) { return s._got; })) achieve('stickers', 'Kolekcionar naljepnica', 250); } }
      raf = requestAnimationFrame(glide); beep(196, .07);
    }
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  });

  /* ---------- retro TV: 4 kanala ---------- */
  var tv = $('#tv'), cv = $('#tvStatic'), knob = $('#tvKnob'), knobP = $('#tvKnobPrev'), chEl = $('#tvCh'), ch = 1, seen = { 1: 1 }, chTimer = null, knobDeg = 0, knobPDeg = -30;
  var chans = $$('.ch'), dots = $$('.tv__dots i'), N = chans.length || 4;
  function noise(ms) {
    if (!cv) return; var g = cv.getContext('2d'), w = cv.width, h = cv.height, end = performance.now() + ms;
    tv.classList.add('is-zapping');
    (function fr() {
      var im = g.createImageData(w, h), d = im.data;
      for (var i = 0; i < d.length; i += 4) { var v = Math.random() * 255 | 0; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
      g.putImageData(im, 0, 0);
      if (performance.now() < end) requestAnimationFrame(fr); else tv.classList.remove('is-zapping');
    })();
    beep(120, ms / 1000, 'sawtooth');
  }
  function setCh(n, user) {
    ch = ((n - 1 + N) % N) + 1;
    noise(260);
    setTimeout(function () {
      chans.forEach(function (c, i) { var on = i === ch - 1; c.classList.toggle('is-on', on); c.setAttribute('aria-hidden', on ? 'false' : 'true'); });
      dots.forEach(function (d, i) { d.classList.toggle('is-on', i === ch - 1); });
      chEl.textContent = 'CH 0' + ch;
    }, 140);
    if (user) {
      addScore(5); seen[ch] = 1;
      if (Object.keys(seen).length === N) achieve('tv', 'Pogledali ste sve kanale', 200);
    }
  }
  function auto() { clearInterval(chTimer); if (!reduce) chTimer = setInterval(function () { if (!doc.hidden && tvVisible) setCh(ch + 1); }, 4200); }
  var tvVisible = true;
  if (tv && 'IntersectionObserver' in window) new IntersectionObserver(function (es) { tvVisible = es[0].isIntersecting; }).observe(tv);
  if (knob) knob.addEventListener('click', function () { knobDeg += 90; knob.style.transform = 'rotate(' + knobDeg + 'deg)'; setCh(ch + 1, true); auto(); });
  if (knobP) knobP.addEventListener('click', function () { knobPDeg -= 90; knobP.style.transform = 'rotate(' + knobPDeg + 'deg)'; setCh(ch - 1, true); auto(); });
  if (tv) auto();

  /* ---------- retro popup (jednom po sesiji) ---------- */
  var win = $('#win');
  function closeWin() { win.classList.remove('is-on'); win.setAttribute('aria-hidden', 'true'); store('kaiWin', '1'); }
  if (win && $('#prednosti') && !store('kaiWin') && 'IntersectionObserver' in window) {
    var wio = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { wio.disconnect(); setTimeout(function () { win.classList.add('is-on'); win.setAttribute('aria-hidden', 'false'); beep(880, .12); setTimeout(function () { beep(660, .2); }, 120); }, 1400); }
    }, { threshold: .5 });
    wio.observe($('#prednosti'));
    $('#winX').addEventListener('click', closeWin); $('#winC').addEventListener('click', closeWin);
    win.querySelector('a').addEventListener('click', function () { store('kaiWin', '1'); });
  }

  /* ---------- konfeti + Konami kod (↑↑↓↓←→←→BA) ---------- */
  var cf = $('#confetti');
  function confetti() {
    if (reduce || !cf) return;
    var g = cf.getContext('2d'), W = cf.width = innerWidth, H = cf.height = innerHeight, cols = ['#FF6F59', '#FFE14A', '#2E37FF', '#00C27A', '#FF4FA3', '#0B0B10'], P = [];
    for (var i = 0; i < 160; i++) P.push({ x: W / 2, y: H * .35, vx: (Math.random() - .5) * 18, vy: -Math.random() * 16 - 4, s: 6 + Math.random() * 8, a: Math.random() * 6, va: (Math.random() - .5) * .4, c: cols[i % cols.length] });
    var t0 = performance.now();
    (function fr(t) {
      g.clearRect(0, 0, W, H);
      P.forEach(function (p) { p.vy += .45; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.a += p.va; g.save(); g.translate(p.x, p.y); g.rotate(p.a); g.fillStyle = p.c; g.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); g.restore(); });
      if (t - t0 < 3200) requestAnimationFrame(fr); else g.clearRect(0, 0, W, H);
    })(t0);
  }
  var K = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65], kp = 0;
  doc.addEventListener('keydown', function (e) {
    kp = (e.keyCode === K[kp]) ? kp + 1 : (e.keyCode === K[0] ? 1 : 0);
    if (kp === K.length) { kp = 0; confetti(); achieve('konami', 'Turbo mod uključen', 1000); }
  });
  $('.coin') && $('.coin').addEventListener('click', confetti);

  /* ---------- kolačići ---------- */
  var KEY = 'kreirai-cookie-consent', cb = $('#cookieBanner'), ok = false;
  try { ok = !!localStorage.getItem(KEY); } catch (e) {}
  if (cb && !ok) { cb.hidden = false; $('#cookieAccept').addEventListener('click', function () { try { localStorage.setItem(KEY, '1'); } catch (e) {} cb.hidden = true; coin(); }); }
})();

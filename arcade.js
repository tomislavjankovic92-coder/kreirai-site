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
  $$('.btn,.tv__knob,.faq summary,.msg__btns a,.msg__btns button,.hud button,.dont,.boom__fix').forEach(function (el) { el.addEventListener('mouseenter', function () { tick(784); }); });

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

  /* ---------- retro poruka: povremeno iskoči u kutu, ne blokira sadržaj ---------- */
  var msg = $('#msg');
  if (msg && !/kontakt/.test(location.pathname)) (function () {
    var MSGS = [
      ['Od: vašeg telefona', '„Zašto više ne zvonim?“'],
      ['Od: vašeg inboxa', '„Ovdje je tiho. Sumnjivo tiho.“'],
      ['Od: Googlea', '„Tražio sam vas na prvoj stranici. Nema vas.“'],
      ['Od: vaše blagajne', '„Gladna sam. Pošaljite kupce.“'],
      ['Od: posjetitelja', '„Stranica se učitava 8 sekundi? Idem kod konkurencije.“'],
      ['Od: konkurencije', '„Hvala što još uvijek nemate novu stranicu.“'],
      ['Od: stare stranice', '„Učitavam se… još malo… samo malo…“']
    ];
    var MAX = 3, FIRST = 20000, GAP = 70000;
    var mobile = matchMedia('(max-width: 760px)').matches, LIFE = mobile ? 11000 : 18000;
    var n = parseInt(store('kaiMsgN') || '0', 10) || 0, closes = parseInt(store('kaiMsgX') || '0', 10) || 0;
    var start = parseInt(store('kaiMsgS') || '-1', 10); if (start < 0) { start = Math.floor(Math.random() * MSGS.length); store('kaiMsgS', start); }
    var hideT, open = false, hover = false, stopped = store('kaiMsgStop') === '1';
    var from = $('#msgFrom'), txt = $('#msgTxt'), bar = $('#msgBar'), cb = $('#cookieBanner');
    function busy() {
      var a = doc.activeElement, tag = a && a.tagName;
      return doc.hidden || (cb && !cb.hidden) || (menu && menu.classList.contains('is-open')) || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
    }
    function schedule(ms) { if (stopped || n >= MAX) return; setTimeout(tryShow, ms); }
    function tryShow() { if (stopped || open) return; if (busy()) return setTimeout(tryShow, 6000); show(); }
    function ring() { for (var k = 0; k < 8; k++) (function (k) { setTimeout(function () { beep(k % 2 ? 1046 : 1318, .05); }, k * 65); })(k); }
    function show() {
      var m = MSGS[(start + n) % MSGS.length];
      from.textContent = m[0]; txt.textContent = m[1];
      n++; store('kaiMsgN', n);
      msg.style.left = msg.style.top = msg.style.right = msg.style.bottom = msg.style.width = ''; msg.style.transform = '';
      msg.classList.remove('is-fly'); msg.classList.add('is-on'); msg.setAttribute('aria-hidden', 'false'); open = true;
      if (!reduce) { msg.classList.add('is-shake'); setTimeout(function () { msg.classList.remove('is-shake'); }, 1000); }
      ring(); armHide();
    }
    function armHide() { clearTimeout(hideT); hideT = setTimeout(function () { if (hover || drag) return armHide(); hide(); }, LIFE); }
    function hide(fly) {
      if (!open) return; open = false; clearTimeout(hideT);
      msg.setAttribute('aria-hidden', 'true');
      if (!fly) msg.classList.remove('is-on');
      setTimeout(function () { msg.classList.remove('is-on', 'is-fly'); msg.style.left = msg.style.top = msg.style.right = msg.style.bottom = msg.style.width = ''; msg.style.transform = ''; }, fly ? 600 : 450);
      schedule(GAP);
    }
    function userClose() { closes++; store('kaiMsgX', closes); if (closes >= 2) { stopped = true; store('kaiMsgStop', '1'); } hide(); beep(440, .06); }
    $('#msgX').addEventListener('click', userClose); $('#msgC').addEventListener('click', userClose);
    $('#msgGo').addEventListener('click', function () { stopped = true; store('kaiMsgStop', '1'); });
    msg.addEventListener('mouseenter', function () { hover = true; }); msg.addEventListener('mouseleave', function () { hover = false; });
    msg.addEventListener('focusin', function () { hover = true; }); msg.addEventListener('focusout', function () { hover = false; });

    /* "baci me": povuci za plavu traku; jači zamah izbaci poruku s ekrana */
    var drag = false, ox = 0, oy = 0, px = 0, py = 0, lx = 0, ly = 0, lt = 0, vx = 0, vy = 0;
    bar.addEventListener('pointerdown', function (e) {
      if (e.target.closest('button') || !open) return;
      var r = msg.getBoundingClientRect();
      msg.style.right = msg.style.bottom = 'auto'; msg.style.width = r.width + 'px'; msg.style.left = r.left + 'px'; msg.style.top = r.top + 'px';
      ox = e.clientX - r.left; oy = e.clientY - r.top; lx = e.clientX; ly = e.clientY; lt = performance.now(); vx = vy = 0;
      drag = true; msg.classList.add('is-drag'); try { bar.setPointerCapture(e.pointerId); } catch (er) {}
      e.preventDefault();
    });
    bar.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var t = performance.now(), dt = Math.max(1, t - lt);
      vx = vx * .5 + ((e.clientX - lx) / dt) * .5; vy = vy * .5 + ((e.clientY - ly) / dt) * .5;
      lx = e.clientX; ly = e.clientY; lt = t;
      px = e.clientX - ox; py = e.clientY - oy;
      msg.style.left = px + 'px'; msg.style.top = py + 'px';
      msg.style.transform = 'rotate(' + Math.max(-12, Math.min(12, vx * 6)) + 'deg)';
    });
    function drop() {
      if (!drag) return; drag = false; msg.classList.remove('is-drag');
      var sp = Math.sqrt(vx * vx + vy * vy);
      if (sp > 1.1 && performance.now() - lt < 80) {
        msg.classList.add('is-fly');
        msg.style.transform = 'translate(' + (vx * 700) + 'px,' + (vy * 700) + 'px) rotate(' + (vx > 0 ? 40 : -40) + 'deg)';
        beep(880, .25, 'square', 110);
        if (window.KAI) KAI.achieve('msg', 'Bacili ste poruku', 25);
        hide(true);
      } else {
        var r = msg.getBoundingClientRect(), W = innerWidth, H = innerHeight;
        msg.style.left = Math.max(8, Math.min(W - r.width - 8, r.left)) + 'px';
        msg.style.top = Math.max(70, Math.min(H - r.height - 8, r.top)) + 'px';
        msg.style.transform = '';
        armHide();
      }
    }
    bar.addEventListener('pointerup', drop); bar.addEventListener('pointercancel', drop);

    if (!stopped && n < MAX) {
      var first = function () { schedule(FIRST); removeEventListener('scroll', first); clearTimeout(ft); };
      addEventListener('scroll', first, { passive: true, once: true });
      var ft = setTimeout(first, 15000);
    }
  })();

  /* ---------- upozorenje: sirena pri prelasku mišem (samo kad je zvuk uključen) ---------- */
  var notice = $('.notice__tape'), lastSiren = 0;
  if (notice) notice.addEventListener('mouseenter', function () {
    var n = Date.now(); if (n - lastSiren < 1500) return; lastSiren = n;
    for (var k = 0; k < 4; k++) (function (k) { setTimeout(function () { beep(k % 2 ? 660 : 880, .11); }, k * 120); })(k);
    achieve('upozorenje', 'Pročitali ste upozorenje', 50);
  });

  /* ---------- dramatični zvučni efekti (samo kad je zvuk uključen) ---------- */
  var noiseBuf = null;
  function nbuf(c) { if (noiseBuf) return noiseBuf; var b = c.createBuffer(1, c.sampleRate * 2, c.sampleRate), d = b.getChannelData(0); for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return (noiseBuf = b); }
  function sTone(f, d, at, o) {
    o = o || {}; if (!soundOn) return; var c = ac(); if (!c) return;
    var t = c.currentTime + at, osc = c.createOscillator(), g = c.createGain();
    osc.type = o.type || 'square'; osc.frequency.setValueAtTime(f, t);
    if (o.slide) osc.frequency.exponentialRampToValueAtTime(o.slide, t + d);
    if (o.vib) { var l = c.createOscillator(), lg = c.createGain(); l.frequency.value = o.vib; lg.gain.value = f * .03; l.connect(lg); lg.connect(osc.frequency); l.start(t); l.stop(t + d + .05); }
    var v = o.vol || .08; g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + (o.att || .01)); g.gain.setValueAtTime(v, t + d * (o.hold || .6)); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    osc.connect(g); g.connect(c.destination); osc.start(t); osc.stop(t + d + .05);
  }
  function sNoise(d, at, o) {
    o = o || {}; if (!soundOn) return; var c = ac(); if (!c) return;
    var t = c.currentTime + at, src = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain();
    src.buffer = nbuf(c); src.loop = true; fl.type = o.filter || 'lowpass'; fl.Q.value = o.q || 1;
    fl.frequency.setValueAtTime(o.f0 || 2000, t); if (o.f1) fl.frequency.exponentialRampToValueAtTime(o.f1, t + d);
    var v = o.vol || .2; g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + (o.att || .005)); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    src.connect(fl); fl.connect(g); g.connect(c.destination); src.start(t, Math.random()); src.stop(t + d + .05);
  }
  function sfxCrash() {
    if (!soundOn) return; var c = ac(); if (c && c.resume) c.resume();
    // sirena
    for (var k = 0; k < 3; k++) { sTone(620, .4, k * .4, { type: 'sawtooth', slide: 1240, vol: .045, hold: .8 }); }
    // pucanje / pukotine
    [0, .12, .27, .5].forEach(function (a, i) { sNoise(.06 + i * .02, a, { filter: 'highpass', f0: 2500, vol: .35 }); });
    // tutnjava
    sNoise(2.6, .15, { filter: 'lowpass', f0: 180, f1: 60, vol: .55, att: .6 });
    // velika eksplozija
    sTone(140, 1.4, .45, { type: 'sine', slide: 28, vol: .5, att: .005, hold: .1 });
    sNoise(1.3, .45, { filter: 'lowpass', f0: 4000, f1: 90, vol: .6 });
    // komadi koji padaju
    for (var i = 0; i < 22; i++) { var a = .55 + Math.random() * 1.5; sNoise(.05 + Math.random() * .08, a, { filter: 'bandpass', f0: 300 + Math.random() * 2500, q: 6, vol: .25 * (1 - (a - .55) / 2) }); }
    // staklo
    for (var s = 0; s < 9; s++) sTone(2200 + Math.random() * 3200, .25, .75 + Math.random() * .5, { type: 'triangle', vol: .04, hold: .05 });
    // tužna truba
    [[196, .32], [185, .32], [175, .32], [165, 1.1]].forEach(function (n, i) {
      sTone(n[0], n[1], 1.75 + i * .36, { type: 'sawtooth', vol: .07, slide: i === 3 ? 150 : null, vib: i === 3 ? 6 : 0, att: .03, hold: .7 });
      sTone(n[0] / 2, n[1], 1.75 + i * .36, { type: 'square', vol: .03, att: .03, hold: .7 });
    });
  }
  function sfxFix() {
    if (!soundOn) return;
    sTone(180, .5, 0, { type: 'square', slide: 1600, vol: .05, hold: .3 });
    sNoise(.5, 0, { filter: 'bandpass', f0: 400, f1: 4000, q: 2, vol: .12 });
    [523, 659, 784, 1046, 1319].forEach(function (f, i) { sTone(f, i === 4 ? .45 : .12, .45 + i * .08, { vol: .07 }); });
  }

  /* ---------- "Nikako ne stiskajte ovo": stranica se raspadne, gumb je popravi ---------- */
  var dont = $('#dontBtn'), boom = $('#boom'), fix = $('#boomFix'), broken = [], isBroken = false;
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function breakPage() {
    if (isBroken || !boom) return; isBroken = true;
    sfxCrash();
    setTimeout(function () { achieve('boom', 'Znatiželja je srušila stranicu', 1); }, 3300);
    var H = innerHeight, els = $$('.nav, .tape-line, .hazard-bar, main section .wrap > *, main > div .wrap > *, .hero__stage > *, .foot__mark, .foot__row > *, .foot__contact, .foot__legal, .foot__danger');
    broken = [];
    els.forEach(function (el) {
      var r = el.getBoundingClientRect(); if (r.bottom < -200 || r.top > H + 200 || !r.width) return;
      var fall = H - r.top + rnd(200, 700), delay = rnd(0, 450) + (r.top < 0 ? 0 : (H - r.top) / H * 250);
      if (reduce) { broken.push(el.animate([{ opacity: 1 }, { opacity: .15 }], { duration: 300, fill: 'forwards' })); return; }
      broken.push(el.animate([
        { transform: 'translate(0,0) rotate(0)' },
        { transform: 'translate(' + rnd(-6, 6) + 'px,' + rnd(-4, 4) + 'px) rotate(' + rnd(-2, 2) + 'deg)', offset: .12 },
        { transform: 'translate(' + rnd(-5, 5) + 'px,' + rnd(-3, 3) + 'px) rotate(' + rnd(-3, 3) + 'deg)', offset: .22 },
        { transform: 'translate(' + rnd(-160, 160) + 'px,' + fall + 'px) rotate(' + rnd(-75, 75) + 'deg)' }
      ], { duration: rnd(1100, 1700), delay: delay, easing: 'cubic-bezier(.55,0,.85,.35)', fill: 'forwards' }));
    });
    document.documentElement.classList.add('is-broken');
    boom.hidden = false; setTimeout(function () { fix.focus({ preventScroll: true }); }, 1400);
  }
  function fixPage() {
    if (!isBroken) return; isBroken = false;
    sfxFix();
    boom.hidden = true;
    var n = broken.length, done = 0;
    broken.forEach(function (a) { a.playbackRate = 2.2; a.reverse(); a.finished.then(function () { a.cancel(); if (++done >= n) document.documentElement.classList.remove('is-broken'); }); });
    if (!n) document.documentElement.classList.remove('is-broken');
    setTimeout(function () { document.documentElement.classList.remove('is-broken'); broken.forEach(function (a) { try { a.cancel(); } catch (e) {} }); }, 1800);
    if (dont) dont.textContent = 'Rekao sam NIKAKO.';
  }
  if (dont) dont.addEventListener('click', breakPage);
  if (fix) fix.addEventListener('click', fixPage);
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') fixPage(); });

  /* ---------- Pikso, maskota: pozdrav i skok ---------- */
  var pik = $('#pikso');
  if (pik) {
    pik.addEventListener('mouseenter', function () { beep(988, .06); setTimeout(function () { beep(1319, .1); }, 70); });
    pik.addEventListener('click', function () {
      pik.classList.remove('is-jump'); void pik.offsetWidth; pik.classList.add('is-jump', 'is-hi');
      beep(260, .16, 'square', 720); setTimeout(function () { beep(1046, .08); }, 180);
      achieve('pikso', 'Upoznali ste Piksa', 25);
      clearTimeout(pik._t); pik._t = setTimeout(function () { pik.classList.remove('is-hi'); }, 1800);
    });
    // Pikso prati pokazivač pogledom (pomak lica za 1 piksel)
    var pface = pik.querySelector('.pikso__face'), pq = 0, pdx = 0, pdy = 0;
    if (pface && !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) {
      window.addEventListener('pointermove', function (e) {
        if (pq) return; pq = requestAnimationFrame(function () {
          pq = 0; var r = pik.getBoundingClientRect(); if (!r.width) return;
          var cx = r.left + r.width / 2, cy = r.top + r.height * .45, dx = e.clientX - cx, dy = e.clientY - cy;
          var nx = Math.abs(dx) > r.width * .6 ? (dx > 0 ? 1 : -1) : 0, ny = Math.abs(dy) > r.height * .6 ? (dy > 0 ? 1 : -1) : 0;
          if (nx !== pdx || ny !== pdy) { pdx = nx; pdy = ny; pface.style.transform = 'translate(' + nx + 'px,' + ny + 'px)'; }
        });
      }, { passive: true });
    }
  }

  /* ---------- šaljivi naslov kartice dok je posjetitelj na drugoj kartici ---------- */
  (function () {
    if (navigator.webdriver || /bot|crawl|spider|lighthouse|headless/i.test(navigator.userAgent)) return;
    var orig = doc.title, away = [
      '📞 Zvoni! Vratite se…',
      'Psst… stranica vas čeka 👀',
      'Telefon vam se dosađuje 😴',
      'Klijenti vas traže na Googleu 🔎',
      '★★★★★ samo nedostajete vi',
      'Hej, ostavili ste nas! 🥺'
    ], i = 0, t = null, back = null;
    doc.addEventListener('visibilitychange', function () {
      clearInterval(t); clearTimeout(back);
      if (doc.hidden) {
        i = 0; doc.title = away[0];
        t = setInterval(function () { i = (i + 1) % away.length; doc.title = away[i]; }, 2000);
      } else {
        doc.title = 'Bok opet! 👋 Igrač 1 se vratio';
        back = setTimeout(function () { doc.title = orig; }, 1800);
      }
    });
  })();

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

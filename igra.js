/* KreirAI mini igra: 4 levela (Informiranje, Izrada, Dorada, Isporuka) */
(function () {
  'use strict';
  var root = document.getElementById('game'); if (!root) return;
  var cv = document.getElementById('gameCv'), ctx = cv.getContext('2d'), ov = document.getElementById('gameOv'), scr = root.querySelector('.game__screen');
  var KAI = window.KAI || { addScore: function () {}, achieve: function () {}, beep: function () {} };
  var T = 32, VW = 640, VH = 352, ROWS = 11;
  var INK = '#0B0B10', CORAL = '#FF6F59', LEMON = '#FFE14A', ULTRA = '#2E37FF', MINT = '#00C27A', PAPER = '#FFF6EA', RED = '#FF2D3D', PINK = '#FF4FA3';
  /* ---------- Pikso (maskota) — pikselni sprite ---------- */
  var PIK = [".......................KKKKKKKKKK.......................", "......................KwwwwwwwwwwK......................", "......................KwkkkkkkkkwK......................", "......................KwkkkkkkkkwK......................", "......................KwkkyyyykkwK......................", "......................KwkkyyyykkwK......................", "......................KwkkyyyykkwK......................", "......................KwkkyyyykkwK......................", "......................KwkkkkkkkkwK......................", "......................KwkkkkkkkkwK......................", "......................KwwwkkkkwwwK......................", ".......................KKwkkkkwKK.......................", ".........KKKKKKKKKKKKKKKKwkkkkwKKKKKKKKKKKKKKKK.........", "........KwwwwwwwwwwwwwwwwwkkkkwwwwwwwwwwwwwwwwwK........", ".......KKwkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkwKK.......", "......KwwwkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkwwwK......", "......KwkkllllllllllllllllllllllllllllllllllcckkwK......", "......KwkkllllllllllllllllllllllllllllllllllcckkwK......", "......KwkkllccccccccccccccccccccccccccccccccddkkwK......", "......KwkkllccccccccccccccccccccccccccccccccddkkwK......", "......KwkkllcckkkkkkkkkkkkkkkkkkkkkkkkkkkkccddkkwK......", "......KwkkllcckkkkkkkkkkkkkkkkkkkkkkkkkkkkccddkkwK......", "......KwkkllcckkggggsssssssssssssssssssskkccddkkwK......", "......KwkkllcckkggggsssssssssssssssssssskkccddkkwK......", ".KKKKKKwkkllcckkssssyywwssssssssyywwsssskkccddkkwKKKKKK.", "KwwwwwwwkkllcckkssssyywwssssssssyywwsssskkccddkkwwwwwwwK", "KwkkcckkkkllcckkssssyyyyssssssssyyyysssskkccddkkkkcckkwK", "KwkkcckkkkllcckkssssyyyyssssssssyyyysssskkccddkkkkcckkwK", "KwkkcckkkkllcckksssssssssssssssssssssssskkccddkkkkcckkwK", "KwkkcckkkkllcckksssssssssssssssssssssssskkccddkkkkcckkwK", "KwkkcckkkkllcckkssppssssyyssssyyssssppsskkccddkkkkcckkwK", "KwkkcckkkkllcckkssppssssyyssssyyssssppsskkccddkkkkcckkwK", "KwkkcckkkkllcckkssssssssssyyyysssssssssskkccddkkkkcckkwK", "KwkkcckkkkllcckkssssssssssyyyysssssssssskkccddkkkkcckkwK", "KwkkwwkkkkllcckksssssssssssssssssssssssskkccddkkkkwwkkwK", "KwkkwwkkkkllcckksssssssssssssssssssssssskkccddkkkkwwkkwK", "KwwwwwwwkkllcckkkkkkkkkkkkkkkkkkkkkkkkkkkkccddkkwwwwwwwK", ".KKKKKKwkkllcckkkkkkkkkkkkkkkkkkkkkkkkkkkkccddkkwKKKKKK.", "......KwkkllccccddccddccddccccccccyyyyccccccddkkwK......", "......KwkkllccccddccddccddccccccccyyyyccccccddkkwK......", "......KwkkccddddddddddddddddddddddddddddddddddkkwK......", "......KwkkccddddddddddddddddddddddddddddddddddkkwK......", "......KwwwkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkwwwK......", ".......KKwkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkwKK.......", "........KwwwwwwwwwkkddkkwwwwwwwwkkddkkwwwwwwwwwK........", ".........KKKKKKKKwkkddkkwKKKKKKwkkddkkwKKKKKKKK.........", "...............KKwkkddkkwKK..KKwkkddkkwKK...............", "..............KwwwkkddkkwwwKKwwwkkddkkwwwK..............", "..............KwkkkkkkkkkkwKKwkkkkkkkkkkwK..............", "..............KwwwwwwwwwwwwKKwwwwwwwwwwwwK..............", "...............KKKKKKKKKKKK..KKKKKKKKKKKK..............."];
  var PIKC = { K: INK, k: INK, w: '#FFFFFF', l: '#FF8E78', c: CORAL, d: '#D9432E', y: LEMON, p: PINK, s: '#1B1B27', g: '#3A3A4D' };
  var pikCache = {};
  function pikFrame(dx, blink, legs) { // legs: 0 stoji, 1 lijeva gore, 2 desna gore, 3 skok
    var key = dx + '|' + blink + '|' + legs; if (pikCache[key]) return pikCache[key];
    var g = PIK.map(function (r) { return r.split(''); }), H = g.length, W = g[0].length, y, x;
    // lice (oči, obrazi, usta) gleda u smjeru kretanja
    var face = [];
    for (y = 22; y <= 35; y++) for (x = 16; x <= 39; x++) { var ch = g[y][x]; if (ch === 'y' || ch === 'w' || ch === 'p') { face.push([y, x, ch]); g[y][x] = 's'; } }
    face.forEach(function (f) { var ch = f[2]; if (blink && f[0] >= 24 && f[0] <= 27) { if (f[0] === 26) ch = 'y'; else return; } g[f[0]][f[1] + dx] = ch; });
    // noge
    function lift(lo, hi, n) { for (var yy = 48 - n; yy <= 47; yy++) for (var xx = lo; xx <= hi; xx++) if (g[yy][xx] === 'd') g[yy][xx] = 'k'; }
    if (legs === 1 || legs === 3) lift(0, 27, 2); if (legs === 2 || legs === 3) lift(28, 55, 2);
    var c = document.createElement('canvas'); c.width = W; c.height = H; var cx = c.getContext('2d');
    for (y = 0; y < H; y++) for (x = 0; x < W; x++) { var col = PIKC[g[y][x]]; if (col) { cx.fillStyle = col; cx.fillRect(x, y, 1, 1); } }
    return (pikCache[key] = c);
  }
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- leveli ---------- */
  function make(w) { var g = []; for (var y = 0; y < ROWS; y++) { var r = []; for (var x = 0; x < w; x++) r.push(y >= 9 ? '#' : '.'); g.push(r); } return g; }
  function put(g, x, y, c) { if (g[y] && x >= 0 && x < g[0].length) g[y][x] = c; }
  function gap(g, x, w) { for (var i = 0; i < w; i++) { put(g, x + i, 9, '.'); put(g, x + i, 10, '.'); } }
  function plat(g, x, y, w, c) { for (var i = 0; i < w; i++) put(g, x + i, y, c || '='); }
  function row(g, x, y, n, c) { for (var i = 0; i < n; i++) put(g, x + i, y, c || 'o'); }
  function col(g, x, top) { for (var y = top; y <= 8; y++) put(g, x, y, '#'); }
  function stairs(g, x, h, down) { for (var i = 0; i < h; i++) col(g, down ? x + i : x + i, down ? 9 - (h - i) : 8 - i); }

  var LV = [
    { name: 'Informiranje', next: 'Izrada', sky: LEMON, tint: 'rgba(11,11,16,.07)', block: CORAL, item: 'bubble', tip: 'Skupite sve informacije o vašem poslu.',
      build: function () { var g = make(92);
        row(g, 5, 7, 4); put(g, 12, 5, 'B'); plat(g, 13, 5, 1); put(g, 14, 5, 'B'); put(g, 19, 8, 'e');
        plat(g, 22, 6, 4); row(g, 22, 5, 4); gap(g, 28, 2); row(g, 31, 7, 3);
        plat(g, 36, 6, 3); plat(g, 40, 4, 3); row(g, 40, 3, 3); put(g, 45, 8, 'e'); put(g, 47, 5, 'B'); put(g, 51, 8, 'e');
        gap(g, 55, 3); row(g, 55, 6, 3); stairs(g, 61, 3); row(g, 61, 5, 3); put(g, 70, 8, 'e');
        plat(g, 74, 6, 4); row(g, 74, 5, 4); row(g, 80, 7, 3); put(g, 86, 8, 'F'); return g; } },
    { name: 'Izrada', next: 'Dorada', sky: ULTRA, tint: 'rgba(255,255,255,.08)', block: LEMON, item: 'code', tip: 'Gradimo stranicu blok po blok.',
      build: function () { var g = make(104);
        row(g, 6, 7, 3); plat(g, 10, 5, 2); put(g, 12, 5, 'B'); plat(g, 13, 5, 2); put(g, 16, 8, 'e'); put(g, 20, 8, '^');
        gap(g, 24, 3); plat(g, 24, 6, 3); row(g, 24, 5, 3); put(g, 30, 8, 'e'); put(g, 33, 8, 'e');
        stairs(g, 37, 4); gap(g, 41, 3); stairs(g, 44, 4, true); row(g, 41, 4, 3);
        put(g, 52, 8, '^'); put(g, 53, 8, '^'); row(g, 52, 6, 2); plat(g, 55, 7, 2); plat(g, 57, 5, 4); put(g, 58, 2, 'B'); put(g, 61, 8, 'e');
        gap(g, 66, 4); plat(g, 67, 6, 2); row(g, 67, 5, 2); put(g, 74, 8, 'e'); plat(g, 77, 6, 3); plat(g, 81, 4, 3); row(g, 81, 3, 3);
        put(g, 86, 8, 'e'); put(g, 90, 8, '^'); row(g, 92, 7, 3); put(g, 98, 8, 'F'); return g; } },
    { name: 'Dorada', next: 'Isporuka', sky: MINT, tint: 'rgba(11,11,16,.08)', block: PINK, item: 'pixel', tip: 'Poliramo svaki piksel do savršenstva.',
      build: function () { var g = make(112);
        row(g, 5, 7, 3); gap(g, 10, 6); plat(g, 11, 6, 2); plat(g, 14, 5, 2); row(g, 14, 4, 2); put(g, 19, 8, 'e');
        plat(g, 20, 7, 1); plat(g, 22, 5, 3); put(g, 23, 2, 'B'); gap(g, 27, 5); plat(g, 28, 6, 1); plat(g, 30, 5, 1); row(g, 30, 4, 1);
        put(g, 35, 8, '^'); put(g, 36, 8, '^'); put(g, 37, 8, '^'); row(g, 35, 6, 3); put(g, 40, 8, 'e'); put(g, 43, 8, 'e');
        stairs(g, 47, 3); gap(g, 50, 4); plat(g, 51, 5, 2); row(g, 51, 4, 2); stairs(g, 54, 3, true);
        plat(g, 60, 6, 2); plat(g, 63, 4, 2); plat(g, 66, 2, 3); row(g, 66, 1, 3); put(g, 70, 8, 'e'); put(g, 73, 8, 'e');
        gap(g, 77, 7); plat(g, 78, 6, 2); plat(g, 81, 5, 2); row(g, 81, 4, 2); put(g, 86, 8, '^'); put(g, 89, 8, 'e');
        put(g, 93, 5, 'B'); plat(g, 94, 5, 2); put(g, 96, 5, 'B'); put(g, 99, 8, 'e'); row(g, 101, 7, 3); put(g, 106, 8, 'F'); return g; } },
    { name: 'Isporuka', next: null, sky: CORAL, tint: 'rgba(11,11,16,.08)', block: LEMON, item: 'star', tip: 'Zadnji korak: stranica ide u svijet!',
      build: function () { var g = make(104);
        row(g, 5, 7, 4); put(g, 11, 5, 'B'); put(g, 12, 5, 'B'); put(g, 16, 8, 'e'); gap(g, 20, 3); row(g, 20, 6, 3);
        stairs(g, 26, 3); put(g, 29, 8, '^'); put(g, 30, 8, '^'); stairs(g, 31, 3, true); row(g, 29, 4, 2); put(g, 36, 8, 'e'); put(g, 39, 8, 'e');
        gap(g, 43, 5); plat(g, 44, 6, 3); row(g, 44, 5, 3); plat(g, 50, 4, 3); put(g, 51, 1, 'B'); put(g, 55, 8, 'e');
        put(g, 59, 8, '^'); put(g, 60, 8, '^'); plat(g, 56, 7, 1); plat(g, 58, 5, 4); row(g, 58, 4, 4); put(g, 65, 8, 'e'); put(g, 68, 8, 'e');
        gap(g, 72, 4); plat(g, 73, 6, 2); row(g, 73, 5, 2); stairs(g, 79, 4); row(g, 79, 4, 4);
        for (var x = 83; x < 104; x++) { col(g, x, 5); } // visoravan za pobjedu
        row(g, 85, 4, 5); put(g, 97, 4, 'W'); return g; } }
  ];

  /* ---------- stanje ---------- */
  var S = { seq: 0, goal: null, lvl: 0, g: null, W: 0, items: 0, total: 0, lives: 3, state: 'title', t: 0, cam: 0, shake: 0, enemies: [], pops: [], parts: [], start: null, flash: 0 };
  var P = { x: 0, y: 0, w: 22, h: 28, vx: 0, vy: 0, on: false, face: 1, coyote: 0, buf: 0, inv: 0, run: 0 };
  var keys = { left: false, right: false, jump: false }, jumpHeld = false;

  function loadLevel(i, keepLives) {
    var L = LV[i]; S.lvl = i; S.g = L.build(); S.W = S.g[0].length; S.enemies = []; S.pops = []; S.parts = []; S.items = 0; S.total = 0;
    if (!keepLives) S.lives = 3;
    for (var y = 0; y < ROWS; y++) for (var x = 0; x < S.W; x++) {
      var c = S.g[y][x];
      if (c === 'e') { S.enemies.push({ x: x * T + 3, y: y * T + 14, w: 26, h: 18, vx: -55, vy: 0, alive: true, squash: 0 }); S.g[y][x] = '.'; }
      if (c === 'o' || c === 'B') S.total++;
    }
    S.goal = null; for (var gy = 0; gy < ROWS; gy++) for (var gx = 0; gx < S.W; gx++) { var gc = S.g[gy][gx]; if (gc === 'F') S.goal = { x: gx * T + 6, win: false }; if (gc === 'W') S.goal = { x: gx * T - 46, win: true }; }
    S.seq++; S.start = { x: 2 * T + 5, y: 8 * T + 2 }; respawn();
  }
  function respawn() { P.x = S.start.x; P.y = S.start.y; P.vx = 0; P.vy = 0; P.inv = 1.2; P.face = 1; S.cam = 0; }

  /* ---------- pomoćne ---------- */
  function tile(tx, ty) { if (tx < 0 || tx >= S.W) return '#'; if (ty < 0) return '.'; if (ty >= ROWS) return '.'; return S.g[ty][tx]; }
  function solid(c) { return c === '#' || c === '=' || c === 'B' || c === 'b'; }
  /* ---------- zvuk igre (vlastiti, ne ovisi o zvuku stranice) ---------- */
  var actx = null, sndOn = true, nbuf = null;
  try { if (localStorage.getItem('kaiGameSnd') === '0') sndOn = false; } catch (e) {}
  function A() { if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } } if (actx.state === 'suspended') actx.resume(); return actx; }
  function tone(f, d, at, o) {
    o = o || {}; if (!sndOn) return; var c = A(); if (!c) return;
    var t = c.currentTime + (at || 0), os = c.createOscillator(), g = c.createGain();
    os.type = o.type || 'square'; os.frequency.setValueAtTime(f, t); if (o.to) os.frequency.exponentialRampToValueAtTime(o.to, t + d);
    var v = o.vol || .07; g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .008); g.gain.setValueAtTime(v, t + d * .55); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    os.connect(g); g.connect(c.destination); os.start(t); os.stop(t + d + .03);
  }
  function hiss(d, at, o) {
    o = o || {}; if (!sndOn) return; var c = A(); if (!c) return;
    if (!nbuf) { nbuf = c.createBuffer(1, c.sampleRate, c.sampleRate); var dd = nbuf.getChannelData(0); for (var i = 0; i < dd.length; i++) dd[i] = Math.random() * 2 - 1; }
    var t = c.currentTime + (at || 0), s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain();
    s.buffer = nbuf; s.loop = true; fl.type = o.type || 'lowpass'; fl.frequency.setValueAtTime(o.f || 1200, t); if (o.to) fl.frequency.exponentialRampToValueAtTime(o.to, t + d);
    var v = o.vol || .15; g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    s.connect(fl); fl.connect(g); g.connect(c.destination); s.start(t, Math.random() * .5); s.stop(t + d + .03);
  }
  function sfx(n) {
    if (n === 'jump') { tone(260, .16, 0, { to: 720, vol: .06 }); tone(520, .1, .02, { to: 1100, type: 'triangle', vol: .03 }); }
    if (n === 'coin') { tone(988, .07, 0, { vol: .06 }); tone(1319, .22, .07, { vol: .06 }); }
    if (n === 'block') { tone(140, .09, 0, { type: 'square', to: 90, vol: .09 }); hiss(.06, 0, { f: 900, vol: .12 }); tone(988, .07, .08, { vol: .06 }); tone(1319, .07, .15, { vol: .06 }); tone(1760, .25, .22, { vol: .05, type: 'triangle' }); }
    if (n === 'stomp') { hiss(.12, 0, { f: 600, to: 120, vol: .25 }); tone(420, .14, 0, { to: 70, vol: .09 }); tone(880, .08, .1, { type: 'triangle', vol: .05 }); tone(1175, .1, .16, { type: 'triangle', vol: .05 }); }
    if (n === 'hurt') { tone(520, .45, 0, { type: 'sawtooth', to: 70, vol: .07 }); hiss(.25, 0, { f: 400, vol: .1 }); }
    if (n === 'clear') [523, 659, 784, 1046, 1319].forEach(function (f, i) { tone(f, i === 4 ? .45 : .12, i * .11, { vol: .07 }); });
    if (n === 'start') [392, 523, 659].forEach(function (f, i) { tone(f, .1, i * .08, { vol: .06 }); });
    if (n === 'win') [523, 659, 784, 1046, 784, 1046, 1568].forEach(function (f, i) { tone(f, i === 6 ? .7 : .15, i * .14, { vol: .07 }); tone(f / 2, i === 6 ? .7 : .15, i * .14, { type: 'triangle', vol: .04 }); });
  }
  var sndBtn = document.getElementById('gameSnd');
  function paintSnd() { if (sndBtn) { sndBtn.setAttribute('aria-pressed', sndOn); sndBtn.textContent = sndOn ? '🔊 Zvuk igre' : '🔈 Zvuk igre'; } }
  if (sndBtn) { paintSnd(); sndBtn.addEventListener('click', function () { sndOn = !sndOn; try { localStorage.setItem('kaiGameSnd', sndOn ? '1' : '0'); } catch (e) {} paintSnd(); if (sndOn) sfx('coin'); }); }
  function burst(x, y, col, n) { for (var i = 0; i < n; i++) S.parts.push({ x: x, y: y, vx: (Math.random() - .5) * 260, vy: -Math.random() * 260 - 60, life: .7, col: col }); }

  /* ---------- fizika ---------- */
  function moveX(o, dx) {
    o.x += dx; var top = Math.floor(o.y / T), bot = Math.floor((o.y + o.h - 1) / T);
    if (dx > 0) { var tx = Math.floor((o.x + o.w - 1) / T); for (var ty = top; ty <= bot; ty++) if (solid(tile(tx, ty))) { o.x = tx * T - o.w; return true; } }
    else if (dx < 0) { var tx2 = Math.floor(o.x / T); for (var ty2 = top; ty2 <= bot; ty2++) if (solid(tile(tx2, ty2))) { o.x = (tx2 + 1) * T; return true; } }
    return false;
  }
  function moveY(o, dy, isP) {
    o.y += dy; var l = Math.floor(o.x / T), r = Math.floor((o.x + o.w - 1) / T); o.on = false;
    if (dy > 0) { var ty = Math.floor((o.y + o.h - 1) / T); for (var tx = l; tx <= r; tx++) if (solid(tile(tx, ty))) { o.y = ty * T - o.h; o.vy = 0; o.on = true; return; } }
    else if (dy < 0) { var ty2 = Math.floor(o.y / T); for (var tx2 = l; tx2 <= r; tx2++) { var c = tile(tx2, ty2); if (solid(c)) { o.y = (ty2 + 1) * T; o.vy = 0; if (isP) bump(tx2, ty2, c); return; } } }
  }
  function bump(tx, ty, c) {
    sfx('block');
    if (c === 'B') { S.g[ty][tx] = 'b'; S.pops.push({ x: tx * T + T / 2, y: ty * T, t: 0 }); S.items++; KAI.addScore(10); setTimeout(function () { sfx('coin'); }, 40); }
  }
  function overlap(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }

  function hurt() {
    if (P.inv > 0 || S.state !== 'play') return;
    sfx('hurt'); S.shake = .35; S.lives--; burst(P.x + P.w / 2, P.y + P.h / 2, CORAL, 16);
    if (S.lives <= 0) { S.state = 'over'; showOver(); return; }
    respawn();
  }

  function update(dt) {
    S.t += dt; if (S.shake > 0) S.shake -= dt; if (S.flash > 0) S.flash -= dt;
    S.parts.forEach(function (p) { p.life -= dt; p.vy += 900 * dt; p.x += p.vx * dt; p.y += p.vy * dt; }); S.parts = S.parts.filter(function (p) { return p.life > 0; });
    S.pops.forEach(function (p) { p.t += dt; }); S.pops = S.pops.filter(function (p) { return p.t < .6; });
    if (S.state !== 'play') return;
    // kretanje
    var acc = 1700, max = 230, dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
    if (dir) { P.vx += dir * acc * dt; P.face = dir; } else { var fr = (P.on ? 1900 : 700) * dt; P.vx = Math.abs(P.vx) <= fr ? 0 : P.vx - Math.sign(P.vx) * fr; }
    P.vx = Math.max(-max, Math.min(max, P.vx));
    P.coyote = P.on ? .09 : P.coyote - dt; P.buf -= dt;
    if (keys.jump && !jumpHeld) { P.buf = .12; } jumpHeld = keys.jump;
    if (P.buf > 0 && P.coyote > 0) { P.vy = -650; P.buf = 0; P.coyote = 0; sfx('jump'); }
    if (!keys.jump && P.vy < -260) P.vy = -260;
    P.vy = Math.min(P.vy + 1900 * dt, 900);
    moveX(P, P.vx * dt); moveY(P, P.vy * dt, true);
    if (P.x < 0) P.x = 0;
    P.run += Math.abs(P.vx) * dt; if (P.inv > 0) P.inv -= dt;
    if (P.y > ROWS * T + 40) { P.inv = 0; hurt(); return; }
    // predmeti, šiljci, cilj
    var l = Math.floor(P.x / T), r = Math.floor((P.x + P.w - 1) / T), t = Math.floor(P.y / T), b = Math.floor((P.y + P.h - 1) / T);
    for (var ty = t; ty <= b; ty++) for (var tx = l; tx <= r; tx++) {
      var c = tile(tx, ty);
      if (c === 'o') { S.g[ty][tx] = '.'; S.items++; KAI.addScore(10); sfx('coin'); burst(tx * T + 16, ty * T + 16, LEMON, 6); }
      if (c === '^' && P.y + P.h > ty * T + 16) hurt();
    }
    if (S.goal && P.x + P.w >= S.goal.x) return S.goal.win ? winGame() : clearLevel();
    // neprijatelji
    S.enemies.forEach(function (e) {
      if (!e.alive) { e.squash += dt; return; }
      if (Math.abs(e.x - P.x) > VW * 1.2) return;
      e.vy = Math.min(e.vy + 1900 * dt, 900);
      var front = e.vx > 0 ? Math.floor((e.x + e.w + 2) / T) : Math.floor((e.x - 2) / T), below = Math.floor((e.y + e.h + 2) / T);
      if (e.on && !solid(tile(front, below))) e.vx *= -1;
      if (moveX(e, e.vx * dt)) e.vx *= -1;
      moveY(e, e.vy * dt, false);
      if (e.y > ROWS * T) e.alive = false;
      if (overlap(P, e)) {
        if (P.vy > 0 && P.y + P.h - e.y < 16) { e.alive = false; P.vy = -430; sfx('stomp'); KAI.addScore(25); burst(e.x + 13, e.y + 9, RED, 10); }
        else hurt();
      }
    });
    S.enemies = S.enemies.filter(function (e) { return e.alive || e.squash < .5; });
    // kamera
    var target = Math.max(0, Math.min(P.x - VW * .4, S.W * T - VW)); S.cam += (target - S.cam) * Math.min(1, dt * 8);
  }

  /* ---------- crtanje ---------- */
  function rr(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function box(x, y, w, h, fill, lw) { ctx.fillStyle = fill; ctx.fillRect(x, y, w, h); ctx.lineWidth = lw || 3; ctx.strokeStyle = INK; ctx.strokeRect(x + (lw || 3) / 2, y + (lw || 3) / 2, w - (lw || 3), h - (lw || 3)); }
  function drawItem(kind, x, y, s) {
    var bob = Math.sin(S.t * 4 + x * .05) * 3; y += bob; ctx.lineWidth = 3; ctx.strokeStyle = INK;
    if (kind === 'bubble') { ctx.fillStyle = '#fff'; rr(x - 11, y - 9, 22, 16, 4); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x - 4, y + 6); ctx.lineTo(x - 7, y + 12); ctx.lineTo(x + 2, y + 6); ctx.fill(); ctx.stroke(); ctx.fillStyle = INK; ctx.font = 'bold 13px Archivo, Arial, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('?', x, y + 4); }
    else if (kind === 'code') { box(x - 12, y - 10, 24, 20, INK, 2); ctx.fillStyle = LEMON; ctx.font = '15px VT323, monospace'; ctx.textAlign = 'center'; ctx.fillText('</>', x, y + 4); }
    else if (kind === 'pixel') { ctx.save(); ctx.translate(x, y); ctx.rotate(Math.PI / 4 + S.t); ctx.fillStyle = LEMON; ctx.fillRect(-7, -7, 14, 14); ctx.strokeRect(-7, -7, 14, 14); ctx.restore(); }
    else { ctx.fillStyle = LEMON; ctx.beginPath(); for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, rad = i % 2 ? 5 : 11; ctx.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad); } ctx.closePath(); ctx.fill(); ctx.stroke(); }
  }
  function drawTile(c, x, y, L) {
    if (c === '#') { ctx.fillStyle = INK; ctx.fillRect(x, y, T, T); var above = tile(Math.round(x / T), Math.round(y / T) - 1); if (!solid(above)) { ctx.fillStyle = L.block; ctx.fillRect(x, y, T, 7); ctx.fillStyle = INK; ctx.fillRect(x, y + 7, T, 2); } ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.lineWidth = 1; ctx.strokeRect(x + .5, y + .5, T - 1, T - 1); }
    else if (c === '=') { box(x, y, T, T, '#fff'); ctx.fillStyle = INK; ctx.fillRect(x + 6, y + 10, T - 12, 3); ctx.fillRect(x + 6, y + 18, T - 18, 3); }
    else if (c === 'B' || c === 'b') { var used = c === 'b'; box(x, y, T, T, used ? '#9a9aa6' : L.block); ctx.fillStyle = used ? INK : '#fff'; ctx.font = '900 14px Archivo, Arial, sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = INK; if (!used) ctx.strokeText('AI', x + 16, y + 21); ctx.fillText(used ? '·' : 'AI', x + 16, y + 21); }
    else if (c === '^') { ctx.fillStyle = RED; ctx.strokeStyle = INK; ctx.lineWidth = 3; for (var i = 0; i < 2; i++) { ctx.beginPath(); ctx.moveTo(x + i * 16 + 1, y + T); ctx.lineTo(x + i * 16 + 8, y + 14); ctx.lineTo(x + i * 16 + 15, y + T); ctx.closePath(); ctx.fill(); ctx.stroke(); } }
    else if (c === 'o') drawItem(L.item, x + 16, y + 16);
    else if (c === 'F') {
      ctx.fillStyle = INK; ctx.fillRect(x + 13, y - 3 * T + 8, 6, 3 * T + 24); var wave = Math.sin(S.t * 5) * 3;
      box(x + 19, y - 3 * T + 10 + wave * .2, 88, 34, LEMON); ctx.fillStyle = INK; ctx.font = '18px VT323, monospace'; ctx.textAlign = 'left'; ctx.fillText((L.next || '').toUpperCase() + ' →', x + 26, y - 3 * T + 33 + wave * .2);
      ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(x + 16, y - 3 * T + 6, 6, 0, 7); ctx.fill();
    }
    else if (c === 'W') { drawTrophy(x, y); }
  }
  function drawTrophy(x, y) {
    var w = 150, h = 110, bx = x - 50, by = y - h + T - 4 + Math.sin(S.t * 2) * 3;
    ctx.save(); ctx.shadowColor = 'rgba(255,225,74,.9)'; ctx.shadowBlur = 20 + Math.sin(S.t * 4) * 8; box(bx, by, w, h, '#fff', 4); ctx.restore();
    box(bx, by, w, h, '#fff', 4); box(bx, by, w, 22, LEMON, 4);
    ctx.fillStyle = INK; [12, 24, 36].forEach(function (d) { ctx.beginPath(); ctx.arc(bx + d, by + 11, 3.5, 0, 7); ctx.fill(); });
    ctx.textAlign = 'center'; ctx.fillStyle = INK; ctx.font = '900 15px Archivo, Arial, sans-serif'; ctx.fillText('VAŠA WEB', bx + w / 2, by + 46); ctx.fillText('STRANICA', bx + w / 2, by + 63);
    ctx.fillStyle = '#F5A400'; ctx.font = '18px Arial, sans-serif'; ctx.fillText('★★★★★', bx + w / 2, by + 88);
    for (var i = 0; i < 6; i++) { var a = S.t * 1.5 + i * Math.PI / 3; ctx.fillStyle = i % 2 ? LEMON : '#fff'; ctx.fillRect(bx + w / 2 + Math.cos(a) * 95 - 3, by + h / 2 + Math.sin(a) * 75 - 3, 6, 6); }
  }
  function drawPlayer() {
    if (P.inv > 0 && Math.floor(S.t * 16) % 2 === 0 && S.state === 'play') return;
    var moving = P.on && Math.abs(P.vx) > 20, legs = !P.on ? 3 : moving ? (Math.floor(P.run / 22) % 2 ? 1 : 2) : 0;
    var blink = (S.t % 3.2) < .12, img = pikFrame(P.face > 0 ? 1 : -1, blink, legs);
    var sw = 44, sh = sw * img.height / img.width, bob = !moving && P.on && Math.floor(S.t * 1.25) % 2 ? 1 : 0;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, Math.round(P.x + P.w / 2 - sw / 2), Math.round(P.y + P.h - sh + 1 - bob), sw, sh);
  }
  function drawEnemy(e) {
    var x = Math.round(e.x), y = Math.round(e.y);
    if (!e.alive) { ctx.globalAlpha = Math.max(0, 1 - e.squash * 2); ctx.fillStyle = RED; ctx.fillRect(x, y + 12, e.w, 6); ctx.globalAlpha = 1; return; }
    var leg = Math.sin(S.t * 18 + x) * 2; ctx.strokeStyle = INK; ctx.lineWidth = 2.5;
    for (var i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(x + 6 + i * 7, y + 12); ctx.lineTo(x + 3 + i * 7 + (i % 2 ? leg : -leg), y + 19); ctx.stroke(); }
    ctx.fillStyle = RED; ctx.beginPath(); ctx.ellipse(x + 13, y + 9, 13, 9, 0, 0, 7); ctx.fill(); ctx.lineWidth = 3; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 13, y); ctx.lineTo(x + 13, y + 18); ctx.lineWidth = 2; ctx.stroke();
    var fx = e.vx < 0 ? x + 2 : x + 18; ctx.fillStyle = '#fff'; ctx.fillRect(fx, y + 4, 6, 5); ctx.fillStyle = INK; ctx.fillRect(fx + (e.vx < 0 ? 0 : 3), y + 5, 3, 3);
  }
  function draw() {
    var L = LV[S.lvl], cw = cv.width, sc = cw / VW;
    ctx.setTransform(sc, 0, 0, sc, 0, 0);
    ctx.fillStyle = L.sky; ctx.fillRect(0, 0, VW, VH);
    // pozadina: mreža + veliki naziv levela (paralaksa)
    var px = -(S.cam * .3) % 40; ctx.strokeStyle = L.tint; ctx.lineWidth = 1;
    for (var gx = px; gx < VW; gx += 40) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, VH); ctx.stroke(); }
    for (var gy = 0; gy < VH; gy += 40) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(VW, gy); ctx.stroke(); }
    ctx.fillStyle = L.tint; ctx.font = '900 120px Archivo, Arial, sans-serif'; ctx.textAlign = 'left';
    var word = L.name.toUpperCase(), ww = ctx.measureText(word + '  ').width || 900, off = -(S.cam * .15) % ww;
    for (var k = 0; k < 3; k++) ctx.fillText(word, off + k * ww, 200);
    var sh = S.shake > 0 && !reduce ? (Math.random() - .5) * 10 : 0;
    ctx.save(); ctx.translate(-Math.round(S.cam) + sh, sh * .5);
    var x0 = Math.max(0, Math.floor(S.cam / T) - 4), x1 = Math.min(S.W, x0 + VW / T + 9);
    for (var y = 0; y < ROWS; y++) for (var x = x0; x < x1; x++) { var c = S.g[y][x]; if (c !== '.' && c !== 'F' && c !== 'W') drawTile(c, x * T, y * T, L); }
    for (y = 0; y < ROWS; y++) for (x = x0; x < x1; x++) { c = S.g[y][x]; if (c === 'F' || c === 'W') drawTile(c, x * T, y * T, L); }
    S.pops.forEach(function (p) { drawItem(L.item, p.x, p.y - 10 - p.t * 60); });
    S.enemies.forEach(drawEnemy); drawPlayer();
    S.parts.forEach(function (p) { ctx.fillStyle = p.col; ctx.fillRect(p.x - 3, p.y - 3, 6, 6); });
    ctx.restore();
    // HUD
    var dark = L.sky === ULTRA;
    ctx.font = '22px VT323, monospace'; ctx.textAlign = 'left'; var lab = 'LV' + (S.lvl + 1) + ' · ' + L.name.toUpperCase(), lw = ctx.measureText(lab).width + 22;
    box(10, 10, lw, 30, INK, 2); ctx.fillStyle = LEMON; ctx.fillText(lab, 21, 32);
    var it = S.items + ' / ' + S.total, iw = ctx.measureText(it).width + 52, ix = Math.max(lw + 24, VW / 2 - iw / 2); box(ix, 10, iw, 30, '#fff', 2); drawItem(L.item, ix + 20, 25); ctx.fillStyle = INK; ctx.font = '22px VT323, monospace'; ctx.textAlign = 'left'; ctx.fillText(it, ix + 38, 32);
    for (var i = 0; i < 3; i++) { box(VW - 40 - i * 28, 12, 22, 22, i < S.lives ? (L.sky === CORAL ? RED : CORAL) : (dark ? '#4a4ff0' : 'rgba(255,255,255,.5)'), 2); }
    if (S.flash > 0) { ctx.fillStyle = 'rgba(255,255,255,' + S.flash + ')'; ctx.fillRect(0, 0, VW, VH); }
  }

  /* ---------- prekrivači (start, level, kraj) ---------- */
  function overlay(html, cls) { ov.className = 'game__ov is-on ' + (cls || ''); ov.innerHTML = html; var b = ov.querySelector('[data-act]'); if (b && root.contains(document.activeElement) && !matchMedia('(pointer:coarse)').matches) b.focus({ preventScroll: true }); }
  function hideOv() { ov.className = 'game__ov'; ov.innerHTML = ''; scr.focus({ preventScroll: true }); }
  function showTitle() {
    S.state = 'title';
    overlay('<span class="game__lbl">MINI IGRA</span><strong>4 levela do<br>vaše stranice</strong><p>Provedite Piksa kroz Informiranje, Izradu, Doradu i Isporuku — skupljajte predmete, gazite bugove i osvojite web stranicu.</p>' +
      '<div class="game__how"><span><b>A</b> <b>D</b> kretanje</span><span><b>W</b> / <b>razmak</b> skok</span></div><button type="button" class="game__btn" data-act="start">▶ Start</button>');
  }
  function later(ms, fn) { var s = S.seq; setTimeout(function () { if (S.seq === s) fn(); }, ms); }
  function levelCard(i) {
    S.state = 'card'; var L = LV[i]; later(1500, function () { if (S.state === 'card') { hideOv(); S.state = 'play'; sfx('start'); } });
    overlay('<span class="game__lbl">LEVEL ' + (i + 1) + ' / 4</span><strong>' + L.name + '</strong><p>' + L.tip + '</p><span class="game__bar"><i></i></span><button type="button" class="game__btn" data-act="go">Kreni →</button>', 'is-card');
  }
  function clearLevel() {
    if (S.state !== 'play') return; S.state = 'clear'; sfx('clear'); S.flash = .5; KAI.addScore(100); keys.left = keys.right = false; later(1700, function () { if (S.state === 'clear') act('next'); });
    var L = LV[S.lvl], all = S.items >= S.total && S.total > 0;
    overlay('<span class="game__lbl">✓ KORAK ' + (S.lvl + 1) + ' GOTOV</span><strong>' + L.name + '<br>odrađena!</strong><p>Skupljeno: ' + S.items + (all ? ' — sve! ★' : '') + '</p><span class="game__bar game__bar--slow"><i></i></span><button type="button" class="game__btn" data-act="next">Sljedeće: ' + L.next + ' →</button>', 'is-clear');
  }
  function winGame() {
    if (S.state !== 'play') return; S.state = 'win'; sfx('win'); S.flash = .8; KAI.addScore(500); KAI.achieve('igra', 'Osvojili ste web stranicu', 300);
    for (var i = 0; i < 80; i++) S.parts.push({ x: P.x + (Math.random() - .5) * 200, y: P.y - 80, vx: (Math.random() - .5) * 420, vy: -Math.random() * 420 - 80, life: 2.2, col: [CORAL, LEMON, ULTRA, MINT, PINK][i % 5] });
    overlay('<span class="game__lbl">★ POBJEDA ★</span><strong>Osvojili ste web stranicu!</strong><p>Zadovoljstvo: 100%. Sva četiri koraka su prijeđena — u stvarnosti to traje oko 10 dana.</p>' +
      '<div class="game__row"><a class="game__btn" href="kontakt.html" data-act="real">Zatražite pravu →</a><button type="button" class="game__btn game__btn--ghost" data-act="again">Igraj ponovno</button></div>', 'is-win');
  }
  function showOver() {
    overlay('<span class="game__lbl">GAME OVER</span><strong>Bugovi su ovaj put pobijedili.</strong><p>Ne brinite — u pravim projektima ih mi gazimo umjesto vas.</p><button type="button" class="game__btn" data-act="retry">Pokušaj ponovno</button>', 'is-over');
  }
  ov.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]'); if (!b) return; var a = b.getAttribute('data-act');
    if (a === 'real') return;
    e.preventDefault(); act(a);
  });
  function act(a) {
    A();
    if (a === 'start') { loadLevel(0); levelCard(0); }
    else if (a === 'go') { if (S.state !== 'card') return; hideOv(); S.state = 'play'; sfx('start'); }
    else if (a === 'next') { if (S.state !== 'clear' || !LV[S.lvl + 1]) return; loadLevel(S.lvl + 1, true); levelCard(S.lvl); }
    else if (a === 'retry') { loadLevel(S.lvl); hideOv(); S.state = 'play'; }
    else if (a === 'again') { loadLevel(0); levelCard(0); }
  }

  /* ---------- kontrole ---------- */
  var active = false;
  var KM = { KeyA: 'left', ArrowLeft: 'left', KeyD: 'right', ArrowRight: 'right', KeyW: 'jump', ArrowUp: 'jump', Space: 'jump' };
  window.addEventListener('keydown', function (e) {
    if (!active) return;
    var k = KM[e.code];
    if (S.state !== 'play') {
      if ((e.code === 'Enter' || e.code === 'Space' || e.code === 'KeyW') && document.activeElement && (document.activeElement === scr || root.contains(document.activeElement))) {
        var b = ov.querySelector('[data-act]'); if (b && b.tagName === 'BUTTON') { e.preventDefault(); act(b.getAttribute('data-act')); }
      }
      return;
    }
    if (k) { e.preventDefault(); keys[k] = true; }
    if (e.code === 'KeyS' || e.code === 'ArrowDown') e.preventDefault();
  });
  root.addEventListener('pointerdown', function () { A(); }, { passive: true });
  window.addEventListener('keyup', function (e) { var k = KM[e.code]; if (k) keys[k] = false; });
  window.addEventListener('blur', function () { keys.left = keys.right = keys.jump = false; });
  root.querySelectorAll('.game__pad [data-k]').forEach(function (b) {
    var k = b.getAttribute('data-k');
    function on(e) { e.preventDefault(); keys[k] = true; b.classList.add('is-down'); if (b.setPointerCapture && e.pointerId != null) try { b.setPointerCapture(e.pointerId); } catch (er) {} }
    function off(e) { keys[k] = false; b.classList.remove('is-down'); }
    b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointercancel', off); b.addEventListener('lostpointercapture', off);
    b.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  });
  // dodir na lijevu/desnu polovicu ekrana igre = kretanje, gornji dio = skok (dodatno uz tipke)
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { active = es[0].isIntersecting; if (!active) keys.left = keys.right = keys.jump = false; }, { threshold: .1 }).observe(scr);
  else active = true;

  /* ---------- veličina i petlja ---------- */
  function resize() { var w = scr.clientWidth, dpr = Math.min(window.devicePixelRatio || 1, 2); cv.width = Math.round(w * dpr); cv.height = Math.round(w * VH / VW * dpr); cv.style.height = (w * VH / VW) + 'px'; }
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(scr); else window.addEventListener('resize', resize);
  resize();
  var last = 0;
  function loop(ts) {
    var dt = Math.min((ts - last) / 1000 || 0, 1 / 30); last = ts;
    if (active && !document.hidden) { update(dt); draw(); }
    requestAnimationFrame(loop);
  }
  loadLevel(0); S.state = 'title'; showTitle(); draw(); requestAnimationFrame(loop);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
})();

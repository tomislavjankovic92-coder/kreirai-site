/*!
 * KreirAI — intro "build u terminalu" (produkcijska verzija, bez ovisnosti)
 *
 * <head> snippet doda "ki-intro-on" (+ "ki-intro-lite" na mobitelu) na <html>.
 * Ova skripta složi terminal, odvrti build, dekodira logo, "rastrga" ekran
 * u trake i pusti postojeći data-reveal ulaz hero sekcije (#pocetna).
 * Na kraju: klasa "ki-intro-done" na <html> + događaj "kreirai:intro-done".
 *
 * Ručno: window.KreirAIIntro.play()   ·   Za demo: ?intro=1 (i &lite=1)
 */
(function () {
  'use strict';

  var doc = document, html = doc.documentElement, running = false;

  var FULL = {
    lite: false, cmd: 'npx kreirai build "vaša-ideja"', typeDur: 1.0,
    logAt: 1.45, logStep: 0.17, bar: 2.35, barDur: 0.65,
    done: 3.05, decodeStep: 0.09, glitch: 3.85, out: 4.15,
    strips: 10, stripAt: 4.2, stripStep: 0.035, end: 5.0,
    heroDecode: true
  };
  var LITE = {
    lite: true, cmd: 'npx kreirai build', typeDur: 0.6,
    logAt: 1.0, logStep: 0.12, bar: 1.65, barDur: 0.45,
    done: 2.15, decodeStep: 0.06, glitch: 2.65, out: 2.75,
    strips: 6, stripAt: 2.8, stripStep: 0.04, end: 3.5,
    heroDecode: true
  };
  var LOG = [
    ['čitam ideju', 'ok'],
    ['generiram dizajn sustav', 'ok'],
    ['slažem komponente', 'ok'],
    ['optimiziram brzinu i SEO', 'ok'],
    ['ljudska provjera', 'odobreno', true]
  ];
  var GLYPHS = '!<>-_\\/[]{}=+*^?#01$%&';

  function el(tag, cls, parent) {
    var n = doc.createElement(tag);
    if (cls) n.className = cls;
    if (parent) parent.appendChild(n);
    return n;
  }
  function rndGlyph() { return GLYPHS[Math.floor(Math.random() * GLYPHS.length)]; }
  function markSeen() { try { sessionStorage.setItem('kreiraiIntroSeen', '1'); } catch (e) {} }

  // Dekodira tekst u elementu: nasumični znakovi -> pravi tekst, slovo po slovo.
  function decode(node, text, startMs, stepMs, done) {
    var t0 = performance.now() + startMs, raf = 0;
    function tick(now) {
      var out = '', all = true;
      for (var i = 0; i < text.length; i++) {
        var ch = text[i];
        if (ch === ' ' || now >= t0 + i * stepMs) out += ch;
        else { out += now >= t0 - 400 ? rndGlyph() : ' '; all = false; }
      }
      node.textContent = out;
      if (!all) raf = requestAnimationFrame(tick); else if (done) done();
    }
    raf = requestAnimationFrame(tick);
    return function cancel() { cancelAnimationFrame(raf); node.textContent = text; };
  }

  // Dekodira naslov hero sekcije, a zadržava njegove <span>-ove (gradijent).
  function decodeHeading(h1, startMs) {
    if (!h1) return;
    var walker = doc.createTreeWalker(h1, NodeFilter.SHOW_TEXT, null), nodes = [], n;
    while ((n = walker.nextNode())) if (n.nodeValue.trim()) nodes.push(n);
    var label = h1.textContent.replace(/\s+/g, ' ').trim();
    h1.setAttribute('aria-label', label);
    var offset = 0, pending = nodes.length;
    nodes.forEach(function (node) {
      var text = node.nodeValue, len = text.replace(/\s/g, '').length;
      decode(node, text, startMs + offset * 22, 22, function () {
        if (--pending === 0) h1.removeAttribute('aria-label');
      });
      offset += len;
    });
  }

  function play(forceLite) {
    if (running) return;
    running = true;
    markSeen();

    var lite = forceLite != null ? !!forceLite : html.classList.contains('ki-intro-lite');
    var C = lite ? LITE : FULL;
    html.classList.add('ki-intro-on');
    html.classList.remove('ki-intro-done');

    var prevOverflow = html.style.overflow;
    html.style.overflow = 'hidden';

    var root = el('div', 'ki-intro' + (lite ? ' ki-intro--lite' : ''));
    root.setAttribute('aria-hidden', 'true');
    var s = root.style;
    s.setProperty('--ki-out', C.out + 's');
    s.setProperty('--ki-glitch', C.glitch + 's');
    s.setProperty('--ki-bar', C.bar + 's');
    s.setProperty('--ki-bar-dur', C.barDur + 's');
    s.setProperty('--ki-done', C.done + 's');
    s.setProperty('--ki-type-dur', C.typeDur + 's');
    s.setProperty('--ki-type-steps', C.cmd.length);
    s.setProperty('--ki-type-w', C.cmd.length + 'ch');

    // zastor od traka
    for (var i = 0; i < C.strips; i++) {
      var st = el('div', 'ki-intro__strip', root);
      st.style.top = (i * 100 / C.strips) + '%';
      st.style.height = (100 / C.strips + 0.3) + '%';
      st.style.setProperty('--ki-strip-anim', i % 2 ? 'ki-strip-r' : 'ki-strip-l');
      st.style.setProperty('--ki-strip-at', (C.stripAt + i * C.stripStep).toFixed(3) + 's');
    }
    el('div', 'ki-intro__glow', root);
    el('div', 'ki-intro__grid', root);
    el('div', 'ki-intro__scan', root);

    var stage = el('div', 'ki-intro__stage', root);
    var jitter = el('div', 'ki-intro__jitter', stage);
    var win = el('div', 'ki-intro__win', jitter);
    win.innerHTML =
      '<div class="ki-intro__bar"><span class="ki-intro__dot"></span><span class="ki-intro__dot"></span><span class="ki-intro__dot"></span>' +
      '<span class="ki-intro__title">kreirai — studio</span></div>' +
      '<div class="ki-intro__body">' +
        '<div class="ki-intro__prompt"><span class="ki-intro__user">studio@kreirai</span><span class="ki-intro__path">~</span><span>$</span>' +
        '<span><span class="ki-intro__cmd"></span><span class="ki-intro__caret"></span></span></div>' +
        '<div class="ki-intro__log"></div>' +
        '<div class="ki-intro__progress"><span>build</span><span class="ki-intro__track"><span class="ki-intro__fill"></span></span><span class="ki-intro__pct">100%</span></div>' +
        '<div class="ki-intro__done"><span class="ki-intro__mark"><span class="ki-k"></span><span class="ki-ai"></span></span>' +
        '<span class="ki-intro__sub">build završen → otvaram stranicu</span></div>' +
      '</div>';
    win.querySelector('.ki-intro__cmd').textContent = C.cmd;
    var log = win.querySelector('.ki-intro__log');
    LOG.forEach(function (row, idx) {
      var r = el('div', 'ki-intro__row', log);
      r.style.animationDelay = (C.logAt + idx * C.logStep).toFixed(2) + 's';
      r.innerHTML = '<i>›</i><span></span><u></u><b' + (row[2] ? ' class="is-human"' : '') + '></b>';
      r.querySelector('span').textContent = row[0];
      r.querySelector('b').textContent = row[1];
    });

    var skipBtn = el('button', 'ki-intro__skip');
    skipBtn.type = 'button';
    skipBtn.textContent = 'Preskoči intro';

    doc.body.appendChild(root);
    doc.body.appendChild(skipBtn);

    // logo "Kreir" + "AI" se dekodira iz znakova
    var kNode = win.querySelector('.ki-k'), aiNode = win.querySelector('.ki-ai');
    var c1 = decode(kNode, 'Kreir', C.done * 1000, C.decodeStep * 1000);
    var c2 = decode(aiNode, 'AI', C.done * 1000 + 5 * C.decodeStep * 1000, C.decodeStep * 1000);

    var finished = false;
    function finish() {
      if (finished) return;
      finished = true;
      clearTimeout(endTimer);
      c1(); c2();
      doc.removeEventListener('keydown', onKey);
      doc.removeEventListener('visibilitychange', onVis);
      [root, skipBtn].forEach(function (n) { if (n.parentNode) n.parentNode.removeChild(n); });
      html.style.overflow = prevOverflow;

      // ponovno pokreni postojeći data-reveal ulaz hero sekcije
      var hero = doc.getElementById('pocetna');
      var items = hero ? hero.querySelectorAll('[data-reveal]') : [];
      Array.prototype.forEach.call(items, function (n) { n.classList.remove('is-visible'); });
      html.classList.remove('ki-intro-on');
      html.classList.add('ki-intro-done');
      void doc.body.offsetHeight;
      requestAnimationFrame(function () {
        Array.prototype.forEach.call(items, function (n) {
          var d = parseInt(n.getAttribute('data-reveal-delay') || '0', 10);
          setTimeout(function () { n.classList.add('is-visible'); }, d);
        });
        if (C.heroDecode && hero) decodeHeading(hero.querySelector('h1'), 120);
      });

      running = false;
      try { doc.dispatchEvent(new CustomEvent('kreirai:intro-done')); } catch (e) {}
    }
    function onKey(e) { if (e.key === 'Escape') finish(); }
    function onVis() { if (doc.hidden) finish(); }

    skipBtn.addEventListener('click', finish);
    doc.addEventListener('keydown', onKey);
    doc.addEventListener('visibilitychange', onVis);
    var endTimer = setTimeout(finish, C.end * 1000);
  }

  window.KreirAIIntro = { play: play };

  function boot() {
    var q = location.search;
    if (/[?&]intro=1\b/.test(q) || window.KREIRAI_INTRO_FORCE) {
      play(/[?&]lite=1\b/.test(q) || html.classList.contains('ki-intro-lite'));
    } else if (html.classList.contains('ki-intro-on')) {
      play();
    }
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

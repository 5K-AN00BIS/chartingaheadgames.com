/* Phone check: tests the site on whatever phone opens /phone-check/ and shows the results, so they can be sent as a screenshot.
   The page isn't linked from the site. Like the rest of the site, this stores nothing and sends nothing anywhere.
   Written in old-style JavaScript on purpose, so it runs even where the site's own script can't.
   It loads before the site's script, so it can note any error that script hits; the checks themselves start once the page is ready. */
var checkErrors = [];
window.onerror = function (msg, src, line) { checkErrors.push(String(msg) + (line ? ' (line ' + line + ')' : '')); if (window.checkUpdate) window.checkUpdate(); };
window.onunhandledrejection = function (e) { var r = e && e.reason; checkErrors.push(String(r && r.message || r)); if (window.checkUpdate) window.checkUpdate(); };

(function () {
  var doc = document, ua = navigator.userAgent;
  var S = { taps: 0, flew: false, glowed: false, site: 'waiting', clipped: null, webp: null, pages: {}, done: 0 };
  var PAGES = [['home', 'Home page', '../', true], ['emberstead', 'Emberstead page', '../emberstead/', false], ['keeper', 'Leviathan Keeper page', '../leviathan-keeper/', false]];
  var reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  function sup(p, v) { try { return !!(window.CSS && CSS.supports && CSS.supports(p, v)); } catch (e) { return false; } }
  function phone() {
    var m = ua.match(/OS (\d+)_(\d+)(?:_(\d+))? like Mac OS X/), os;
    if (m) os = 'iOS ' + m[1] + '.' + m[2] + (m[3] ? '.' + m[3] : '');
    else if (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) os = 'iPad';
    else if (/Android ([\d.]+)/.test(ua)) os = 'Android ' + RegExp.$1;
    else os = /Windows/.test(ua) ? 'Windows' : /Mac OS X/.test(ua) ? 'Mac' : 'Other';
    var br = /CriOS/.test(ua) ? 'Chrome' : /FxiOS/.test(ua) ? 'Firefox' : /EdgiOS|Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Version\/[\d.]+.*Safari/.test(ua) ? 'Safari' : 'in-app browser';
    return os + ' · ' + br + ' · screen ' + screen.width + '×' + screen.height + ' @' + (window.devicePixelRatio || 1) + 'x';
  }
  function features() {
    var f = [['aspect-ratio', sup('aspect-ratio', '1 / 1')], ['Web Animations', typeof Element.prototype.animate === 'function'], ['motion paths', sup('offset-path', 'path("M0 0L1 1")')],
      ['new media listener', !!(window.matchMedia && matchMedia('all').addEventListener)], ['IntersectionObserver', 'IntersectionObserver' in window], ['scroll timelines', sup('animation-timeline', 'scroll()')],
      ['WebP', S.webp === null ? '…' : S.webp]];
    var out = [];
    for (var i = 0; i < f.length; i++) out.push(f[i][0] + ' ' + (f[i][1] === '…' ? '…' : f[i][1] ? 'yes' : 'no'));
    return out.join(' · ');
  }

  function row(dt, dd) { return '<div><dt>' + dt + '</dt><dd>' + dd + '</dd></div>'; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function update() {
    var html = row('Phone', esc(phone())) + row('Reduce Motion', reduce ? 'On' : 'Off');
    html += row('Errors', checkErrors.length ? esc(checkErrors.join(' | ')) : 'None');
    html += row("Site's script", { running: 'Running', waiting: '…', stopped: 'Started, then stopped', none: "Didn't start" }[S.site]);
    var taps = S.taps ? S.taps + ' seen' + (S.flew ? ' · sparks flew' : S.glowed ? ' · glowed' : ' · no sparks') : 'None yet';
    html += row('Fire taps', taps);
    html += row('Sparks outside the fire', S.clipped === null ? '…' : S.clipped ? 'Cut off by this phone' : 'Shown');
    for (var i = 0; i < PAGES.length; i++) { var r = S.pages[PAGES[i][0]]; html += row(PAGES[i][1], !r ? '…' : r.length ? esc(r.join(', ')) : 'Ready'); }
    html += row('Newer features', features());
    doc.getElementById('rows').innerHTML = html;

    var v = doc.getElementById('verdict'), bad = checkErrors.length || S.site === 'stopped' || S.site === 'none', pending = S.site === 'waiting' || S.done < PAGES.length || S.clipped === null, text, cls = '';
    for (var k in S.pages) if (S.pages[k].length) bad = true;
    if (bad) { text = "Something isn't working on this phone. Please send us a screenshot of this page."; cls = 'bad'; }
    else if (pending) text = 'Checking…';
    else if (reduce) { text = "Everything is working. Reduce Motion is turned on in this phone's settings, so the site keeps still and a tapped fire only glows."; cls = 'ok'; }
    else if (S.clipped) { text = 'This phone cuts off the sparks. Please send us a screenshot of this page.'; cls = 'bad'; }
    else if (!S.taps) text = 'Now tap the fire.';
    else if (S.flew) { text = 'Everything is working on this phone.'; cls = 'ok'; }
    else { text = "The fire didn't throw sparks. Please send us a screenshot of this page."; cls = 'bad'; }
    v.textContent = text; v.className = 'verdict' + (cls ? ' ' + cls : '');
  }
  window.checkUpdate = update;

  // Old Safari cut off anything sticking out of a button, which would hide sparks once they leave the fire. Test it directly.
  function clipTest() {
    var p = doc.createElement('div'); p.className = 'probe'; p.setAttribute('aria-hidden', 'true');
    p.innerHTML = '<button type="button" tabindex="-1" style="position:absolute;left:40px;top:120px;width:80px;height:60px;margin:0;padding:0;border:0;background:none;overflow:visible"><i style="position:absolute;display:block;left:20px;top:-100px;width:40px;height:40px"></i></button>';
    doc.body.appendChild(p);
    var hit = doc.elementFromPoint(80, 40);
    S.clipped = !(hit && hit.tagName === 'I');
    doc.body.removeChild(p);
  }

  // Open each page out of sight and look at what the site's script did there.
  function checkPage(i) {
    if (i >= PAGES.length) return;
    var pg = PAGES[i], box = doc.createElement('div'), f = doc.createElement('iframe'), finished = false;
    box.className = 'pages'; box.setAttribute('aria-hidden', 'true'); f.setAttribute('tabindex', '-1'); f.title = pg[1];
    function finish(notes) { if (finished) return; finished = true; S.pages[pg[0]] = notes; S.done++; update(); setTimeout(function () { doc.body.removeChild(box); checkPage(i + 1); }, 50); }
    var timer = setTimeout(function () { finish(["didn't load"]); }, 20000);
    f.onload = function () {
      setTimeout(function () {
        clearTimeout(timer);
        var d, notes = [];
        try { d = f.contentDocument; } catch (e) { }
        if (!d) return finish(["couldn't look inside"]);
        var started = /(^|\s)js(\s|$)/.test(d.documentElement.className), poster = d.querySelector('.poster');
        if (!poster || poster.offsetHeight < 100) notes.push('picture missing');
        if (!started) notes.push("script didn't start");
        else if (d.querySelectorAll('[data-fire]').length || !d.querySelectorAll('.fire-btn').length) notes.push('fires not ready');
        if (pg[3]) { var t = d.querySelector('.trail-ink'); if (!t || !t.getAttribute('d')) notes.push('trail missing'); }
        // is anything lying on top of the picture's fire, so a tap would land on that instead?
        var fb = d.querySelector('.poster .fire-btn');
        if (fb) { var r = fb.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, el = cy > 0 && cy < f.contentWindow.innerHeight ? d.elementFromPoint(cx, cy) : fb;
          if (el && el !== fb && !fb.contains(el)) notes.push('fire covered by ' + (el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className || el.tagName.toLowerCase())); }
        if (!notes.length) return finish(notes);
        // something's wrong: run the site's script there again to catch its error message
        var x = new XMLHttpRequest();
        x.onload = function () { try { f.contentWindow.eval(x.responseText); } catch (e) { notes.push('error: ' + (e && e.message || e)); } finish(notes); };
        x.onerror = function () { finish(notes); };
        x.open('GET', '../site.js'); x.send();
      }, 900);
    };
    f.src = pg[2]; box.appendChild(f); doc.body.appendChild(box);
  }

  function start() {
    var btn = doc.querySelector('.check-fire .fire-btn');
    S.site = !/(^|\s)js(\s|$)/.test(doc.documentElement.className) ? 'none' : btn ? 'running' : 'stopped';
    if (btn) btn.addEventListener('click', function () {
      S.taps++; update();
      setTimeout(function () { // a moment later, see whether a spark has moved away from the fire
        var s = btn.querySelector('.spark');
        if (s) { var a = s.getBoundingClientRect(), b = btn.getBoundingClientRect(), dx = a.left + a.width / 2 - (b.left + b.width / 2), dy = a.top + a.height / 2 - (b.top + b.height * .42); if (Math.sqrt(dx * dx + dy * dy) > 8) S.flew = true; }
        else if (/(^|\s)glow(\s|$)/.test(btn.className)) S.glowed = true;
        update();
      }, 350);
    });
    try { clipTest(); } catch (e) { checkErrors.push('clip test: ' + e.message); }
    var img = new Image();
    img.onload = function () { S.webp = img.width > 0; update(); }; img.onerror = function () { S.webp = false; update(); };
    img.src = 'data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA';
    update(); checkPage(0);
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', start); else start();
})();

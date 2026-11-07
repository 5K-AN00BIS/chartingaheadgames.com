/* Charting Ahead Games: the small layer of movement on top of the pages.
   Every page reads, scrolls and links without this file. It stores nothing and loads nothing from anywhere.
   With "reduce motion" on, nothing moves when you scroll, and tapping a fire only makes it glow. */
(() => {
  'use strict';
  const doc = document, root = doc.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const still = () => reduce.matches;
  const cssScroll = !!(window.CSS && CSS.supports && CSS.supports('animation-timeline: scroll()'));
  root.classList.add('js');
  // Phones only show the pressed look on cards when the page listens for touches.
  addEventListener('touchstart', () => {}, { passive: true });

  /* 1. The poster: its ridges drift at different speeds and the sky darkens as you scroll.
        Browsers with CSS scroll timelines do this in CSS, off the main thread. This is the same effect for the rest. */
  const poster = doc.querySelector('[data-poster]');
  const layers = poster ? [...poster.querySelectorAll('[data-speed]')] : [];
  const night = doc.querySelector('.sky-night');
  let posterH = 0;

  /* 2. The trail: a path through every game's marker, drawn on as you scroll, with a hiker walking it. */
  const games = doc.querySelector('[data-trail]');
  const svgNS = 'http://www.w3.org/2000/svg';
  let ink, reveal, hikerEl, table = [], total = 0, restLen = 0, lastLen = -1;
  if (games) {
    const svg = doc.createElementNS(svgNS, 'svg'); svg.setAttribute('class', 'trail-svg'); svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = `<defs><mask id="trail-reveal" maskUnits="userSpaceOnUse"><path class="trail-mask" pathLength="1"/></mask></defs><path class="trail-ink" mask="url(#trail-reveal)"/>`;
    games.prepend(svg);
    ink = svg.querySelector('.trail-ink'); reveal = svg.querySelector('.trail-mask');
    hikerEl = doc.createElement('span'); hikerEl.className = 'hiker'; hikerEl.setAttribute('aria-hidden', 'true'); games.append(hikerEl);
    games.classList.add('trail-live');
  }
  function layoutTrail() {
    if (!games) return;
    const box = games.getBoundingClientRect(), W = games.clientWidth, H = games.offsetHeight;
    const els = [...games.querySelectorAll('.marker')];
    // the trail runs through the middle of each marker's diamond and ends on top of the last one, where the hiker stops
    const marks = els.map((m, i) => { const r = m.getBoundingClientRect(); return [r.left - box.left + r.width / 2, r.top - box.top + r.height * (i === els.length - 1 ? .05 : .34)]; });
    if (!marks.length) return;
    const head = games.querySelector('h2'), start = head ? head.getBoundingClientRect().bottom - box.top + (W < 900 ? 52 : 64) : -8;
    const gx = marks[0][0], amp = W < 900 ? 9 : 34, pts = [[gx, start]];
    let prev = pts[0]; marks.forEach((m, i) => { const dy = m[1] - prev[1]; pts.push([gx + amp * (i % 2 ? -1 : 1), prev[1] + dy * .33], [gx - amp * .7 * (i % 2 ? -1 : 1), prev[1] + dy * .68], m); prev = m; });
    // a smooth curve through the points
    let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) { const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2; d += `C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`; }
    const svg = ink.ownerSVGElement; svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.style.height = H + 'px';
    ink.setAttribute('d', d); reveal.setAttribute('d', d);
    hikerEl.style.offsetPath = `path("${d}")`;
    total = ink.getTotalLength(); table = [];
    for (let i = 0; i <= 240; i++) { const l = total * i / 240; table.push([l, ink.getPointAtLength(l).y]); }
    const firstY = marks[0][1] - (W < 900 ? 30 : 40); restLen = (table.find(t => t[1] >= firstY) || table[table.length - 1])[0]; // at rest the hiker stands just above the first marker
    lastLen = -1;
  }
  function trailAt(len, drawTo) {
    if (!games || !total) return;
    hikerEl.style.offsetDistance = (len / total * 100).toFixed(3) + '%';
    reveal.style.strokeDashoffset = (1 - drawTo / total).toFixed(4);
    if (lastLen >= 0) { const step = Math.floor(len / 13) % 2; hikerEl.dataset.step = step; const a = ink.getPointAtLength(Math.max(0, len - 3)).x, b = ink.getPointAtLength(Math.min(total, len + 3)).x; if (Math.abs(b - a) > .4) hikerEl.dataset.face = b < a ? 'left' : 'right'; }
    lastLen = len;
  }

  let queued = false;
  function frame() {
    queued = false;
    if (still()) return;
    const y = scrollY, vh = innerHeight;
    if (poster && !cssScroll && posterH) {
      const p = Math.min(1, Math.max(0, y / posterH));
      for (const l of layers) l.style.transform = `translate3d(0, ${(p * +l.dataset.speed * posterH).toFixed(1)}px, 0)`;
      if (night) night.style.opacity = Math.min(1, y / (posterH * .9)).toFixed(3);
    }
    if (games && total) {
      // keep the hiker about sixty per cent of the way down the screen while you scroll the trail
      const top = games.getBoundingClientRect().top, target = vh * .6 - top;
      let len = 0; if (target >= table[table.length - 1][1]) len = total; else if (target > table[0][1]) { for (let i = 1; i < table.length; i++) if (table[i][1] >= target) { const a = table[i - 1], b = table[i], t = (target - a[1]) / ((b[1] - a[1]) || 1); len = a[0] + (b[0] - a[0]) * t; break; } }
      trailAt(len, len);
    }
  }
  const request = () => { if (!queued) { queued = true; requestAnimationFrame(frame); } };
  function settle() { // reduced motion, or a resize: put everything in its resting place
    posterH = poster ? poster.offsetHeight : 0;
    layoutTrail();
    if (still()) { for (const l of layers) l.style.transform = ''; if (night) night.style.opacity = ''; if (games && total) trailAt(restLen, total); }
    else frame();
  }
  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', settle);
  reduce.addEventListener('change', settle);
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(settle); settle();
  addEventListener('load', settle);

  /* 3. A postmark lands on each game's picture the first time it scrolls into view. */
  const marks = [...doc.querySelectorAll('.postmark')];
  if (marks.length && 'IntersectionObserver' in window && !still()) {
    marks.forEach(m => m.classList.add('pre'));
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.remove('pre'); e.target.classList.add('inked'); io.unobserve(e.target); } }), { threshold: .9 });
    marks.forEach(m => io.observe(m));
  }

  /* 4. Tap a fire and it throws sparks. The fires only become buttons here, so without this file they are just pictures. */
  doc.querySelectorAll('[data-fire]').forEach(el => {
    const b = doc.createElement('button'); b.type = 'button'; b.className = el.className + ' fire-btn'; b.setAttribute('aria-label', el.dataset.fire);
    el.replaceWith(b);
    b.addEventListener('click', () => sparks(b));
  });
  function sparks(b) {
    b.classList.remove('flare', 'glow'); void b.offsetWidth;
    if (still()) { b.classList.add('glow'); setTimeout(() => b.classList.remove('glow'), 900); return; }
    b.classList.add('flare');
    const w = b.offsetWidth, n = 16 + Math.round(Math.random() * 6);
    for (let i = 0; i < n; i++) {
      const s = doc.createElement('i'); s.className = 'spark s' + (i % 3); b.append(s);
      const a = (-90 + (Math.random() - .5) * 120) * Math.PI / 180, dist = w * (.55 + Math.random() * 1.15), dx = Math.cos(a) * dist, dy = Math.sin(a) * dist, size = .6 + Math.random() * .8;
      const anim = s.animate([
        { transform: `translate(-50%, -50%) scale(${size})`, opacity: 1 },
        { transform: `translate(calc(-50% + ${(dx * .62).toFixed(1)}px), calc(-50% + ${(dy * .7).toFixed(1)}px)) scale(${size})`, opacity: 1, offset: .5 },
        { transform: `translate(calc(-50% + ${dx.toFixed(1)}px), calc(-50% + ${(dy * .82 + w * .22).toFixed(1)}px)) scale(${(size * .3).toFixed(2)}) rotate(120deg)`, opacity: 0 },
      ], { duration: 700 + Math.random() * 650, delay: Math.random() * 90, easing: 'cubic-bezier(.2,.75,.35,1)', fill: 'both' });
      anim.onfinish = () => s.remove();
    }
  }
})();

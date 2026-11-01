/*
 * Ink reveal — after AnimatedWebs "Ink Spread Text Reveal" (Quillforge, free template):
 * every glyph is drawn by particles that drift on a noise field and settle into the letter,
 * leaving soft ink stamps so edges bleed like wet ink on paper. Cormorant Garamond, bronze ink,
 * the ampersand in gold italic as in the logo. The real heading stays in the page for screen
 * readers and search engines; this canvas is decoration.
 */
const hash = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
const noise = (x, y) => {
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  const a = hash(ix, iy), b = hash(ix + 1, iy), c = hash(ix, iy + 1), d = hash(ix + 1, iy + 1);
  return (a + (b - a) * ux) + ((c + (d - c) * ux) - (a + (b - a) * ux)) * uy;
};

export function ink(canvas, { text = 'LUXE & LITTLE', onDone = () => {} } = {}) {
  const ctx = canvas.getContext('2d');
  const mobile = matchMedia('(max-width: 760px)').matches;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const dpr = mobile ? 1 : Math.min(2, devicePixelRatio || 1);
  const perLetter = mobile ? 520 : 1000;
  const stagger = mobile ? 110 : 160, step = mobile ? 30 : 40, life = mobile ? 950 : 1250;

  let layout = null;
  const font = (size, italic) => `${italic ? 'italic ' : ''}500 ${size}px "Cormorant Garamond", Garamond, serif`;

  function measure() {
    const w = canvas.clientWidth, chars = [...text];
    const track = 0.14; // letter-spacing in em, as the logo
    ctx.font = font(100, false);
    let total = 0;
    chars.forEach((ch, i) => { ctx.font = font(100, ch === '&'); total += ctx.measureText(ch).width + (i < chars.length - 1 ? track * 100 : 0); });
    const size = Math.min(mobile ? 64 : 118, (w * 0.94) / total * 100);
    const h = Math.ceil(size * 1.3);
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    canvas.style.height = h + 'px';
    let x = (w - total * size / 100) / 2;
    const glyphs = chars.map((ch) => {
      ctx.font = font(size, ch === '&');
      const gw = ctx.measureText(ch).width;
      const g = { ch, x, w: gw, italic: ch === '&' };
      x += gw + track * size;
      return g;
    });
    return { w, h, size, glyphs, baseline: h * 0.78 };
  }

  function paintFinal(alpha = 1, clear = true) {
    const L = layout;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (clear) ctx.clearRect(0, 0, L.w, L.h);
    ctx.globalAlpha = alpha;
    L.glyphs.forEach((g) => {
      ctx.font = font(L.size, g.italic);
      ctx.fillStyle = g.italic ? '#B98A55' : '#7A4F2A';
      ctx.fillText(g.ch, g.x, L.baseline);
    });
    ctx.globalAlpha = 1;
  }

  // Sample each glyph's pixels into target points for its particles.
  function targets(g) {
    const L = layout, off = document.createElement('canvas');
    const pad = Math.ceil(L.size * 0.3);
    off.width = Math.ceil(g.w + pad * 2); off.height = Math.ceil(L.h);
    const o = off.getContext('2d', { willReadFrequently: true });
    o.font = font(L.size, g.italic); o.fillStyle = '#000';
    o.fillText(g.ch, pad, L.baseline);
    const data = o.getImageData(0, 0, off.width, off.height).data, pts = [];
    const gap = Math.max(1, Math.round(L.size / 70));
    for (let y = 0; y < off.height; y += gap) for (let x = 0; x < off.width; x += gap) if (data[(y * off.width + x) * 4 + 3] > 128) pts.push([g.x - pad + x, y]);
    return pts;
  }

  function run() {
    layout = measure();
    if (reduce) { paintFinal(); onDone(); return; }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, layout.w, layout.h);

    const parts = [];
    layout.glyphs.forEach((g, i) => {
      if (g.ch === ' ') return;
      const pts = targets(g);
      if (!pts.length) return;
      const n = Math.min(perLetter, pts.length * 3);
      for (let k = 0; k < n; k++) {
        const [tx, ty] = pts[(Math.random() * pts.length) | 0];
        const a = Math.random() * Math.PI * 2, r = layout.size * (0.05 + Math.random() * 0.12);
        parts.push({ x: tx + Math.cos(a) * r, y: ty + Math.sin(a) * r, tx, ty, t0: stagger + i * step + Math.random() * 120,
          gold: g.italic, done: false });
      }
    });

    const start = performance.now();
    let last = layout.glyphs.length * step + stagger + life + 200;
    const frame = (now) => {
      const t = now - start;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      for (const p of parts) {
        if (p.done || t < p.t0) continue;
        const age = (t - p.t0) / life;
        if (age >= 1) { p.done = true; continue; }
        const ang = noise(p.x * 0.012, p.y * 0.012 + t * 0.0004) * Math.PI * 4;
        p.x += Math.cos(ang) * 0.55 + (p.tx - p.x) * 0.06;
        p.y += Math.sin(ang) * 0.55 + (p.ty - p.y) * 0.06;
        const rad = 1.1 + (1 - age) * 1.6;
        ctx.globalAlpha = 0.07 + age * 0.12;
        ctx.fillStyle = p.gold ? '#B98A55' : (Math.random() < 0.15 ? '#9C6A3B' : '#7A4F2A');
        ctx.beginPath(); ctx.arc(p.x, p.y, rad, 0, 6.283); ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (t < last) { requestAnimationFrame(frame); return; }
      // Settle: crossfade the bled ink into crisp letters.
      const snap = ctx.getImageData(0, 0, canvas.width, canvas.height), s0 = performance.now();
      const settle = (n2) => {
        const k = Math.min(1, (n2 - s0) / 700);
        ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.putImageData(snap, 0, 0);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        paintFinal(k, false);
        if (k < 1) requestAnimationFrame(settle); else { paintFinal(); onDone(); }
      };
      requestAnimationFrame(settle);
    };
    requestAnimationFrame(frame);
  }

  document.fonts.load(font(100, false)).then(() => document.fonts.load(font(100, true))).finally(run);
  let rt;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (layout && canvas.clientWidth !== layout.w) { layout = measure(); paintFinal(); } }, 150); }, { passive: true });
}

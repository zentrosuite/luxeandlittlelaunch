/*
 * Silk background — after AnimatedWebs "Domain Warped Flow Field" (Gossamer Weave, free template):
 * fractal noise, domain-warped, drifting slowly like silk in a breeze. Recoloured to the
 * Luxe & Little palette (cream, blush, champagne). Rendered at reduced resolution and upscaled
 * (the pattern is soft, so it looks the same and costs a fraction on phones), paused when hidden,
 * frozen for reduced motion, CSS gradient when WebGL is unavailable.
 */
export function silk(canvas) {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
  if (!gl) { canvas.classList.add('no-webgl'); return; }

  const mobile = matchMedia('(max-width: 760px)').matches;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const octaves = mobile ? 2 : 3;

  const vert = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const frag = `
precision mediump float;
uniform vec2 uRes; uniform float uTime;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.,0.)), u.x), mix(hash(i + vec2(0.,1.)), hash(i + vec2(1.,1.)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < ${octaves}; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
  return v;
}
void main(){
  vec2 uv = gl_FragCoord.xy / uRes.xy;
  uv.x *= uRes.x / uRes.y;
  vec2 b = uv * 2.0;
  // Two-level domain warp: the silk folds.
  vec2 q = vec2(fbm(b + vec2(0.0, 0.10 * uTime)), fbm(b + vec2(5.2, 1.3) - 0.08 * uTime));
  vec2 r = vec2(fbm(b + 1.8 * q + vec2(1.7, 9.2) + 0.05 * uTime), fbm(b + 1.8 * q + vec2(8.3, 2.8) - 0.04 * uTime));
  float n = fbm(b + 1.6 * r);
  vec3 cream = vec3(0.992, 0.969, 0.922);   // #FDF7EB
  vec3 blush = vec3(0.945, 0.792, 0.745);   // soft #F1CABE
  vec3 champ = vec3(0.886, 0.784, 0.627);   // #E2C8A0
  vec3 col = mix(cream, blush, smoothstep(0.30, 0.72, n));
  col = mix(col, champ, smoothstep(0.50, 0.92, length(q) * 0.62) * 0.7);
  // Sheen along the folds.
  col += vec3(1.0, 0.97, 0.92) * pow(smoothstep(0.45, 0.95, r.x), 3.0) * 0.26;
  col -= vec3(0.05, 0.06, 0.07) * smoothstep(0.55, 0.15, r.y); // soft shadow in the folds
  gl_FragColor = vec4(col, 1.0);
}`;

  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, vert));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.classList.add('no-webgl'); return; }
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const uRes = gl.getUniformLocation(prog, 'uRes');
  const uTime = gl.getUniformLocation(prog, 'uTime');

  // Render scale: the field is soft, so half resolution (a third on phones) is invisible.
  const scale = mobile ? 0.34 : 0.5;
  const resize = () => {
    const w = Math.max(1, Math.round(canvas.clientWidth * scale));
    const h = Math.max(1, Math.round(canvas.clientHeight * scale));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
    gl.uniform2f(uRes, w, h);
  };
  resize();
  addEventListener('resize', resize, { passive: true });

  let raf = 0, start = performance.now(), offset = 18; // start mid-drift, not on a plain frame
  const draw = (now) => {
    gl.uniform1f(uTime, offset + (now - start) / 1000 * 0.35);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  const loop = (now) => { draw(now); raf = requestAnimationFrame(loop); };

  if (reduce) { draw(performance.now()); canvas.classList.add('is-on'); return; }
  raf = requestAnimationFrame(loop);
  requestAnimationFrame(() => canvas.classList.add('is-on'));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(raf); offset += (performance.now() - start) / 1000 * 0.35; }
    else { start = performance.now(); raf = requestAnimationFrame(loop); }
  });
}

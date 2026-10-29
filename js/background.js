/* Page background: soft leaf shadows drawn with WebGL, so they stay sharp at any size and sway slowly.
   If WebGL is missing or fails, the canvas stays hidden and the texture image on <body> shows instead. */
import { root, reducedMotion, on } from './utils.js';

/* each page gets its own leaf arrangement */
const SEEDS = { home: 7, resume: 89, '3tentos': 23, bestegg: 41, tentoscap: 58, foca: 76 };
const FRAME_MS = 33; /* about 30 frames per second is plenty for a slow sway */

const VERTEX = 'attribute vec2 p; varying vec2 vUv; void main(){ vUv = p*0.5+0.5; vUv.y = 1.0 - vUv.y; gl_Position = vec4(p,0.0,1.0); }';

const FRAGMENT = `precision highp float;
varying vec2 vUv;
uniform vec3 uBase; uniform vec3 uShade;
uniform vec4 uLook; // intensity, scale, angle, softness
uniform vec4 uMisc; // time, seed, grain, density
uniform vec3 uSize; // width, height, falloff
float hash21(vec2 p){ vec2 q = fract(p*vec2(123.34,456.21)); q += dot(q, q+45.32); return fract(q.x*q.y); }
float vnoise(vec2 p){ vec2 i=floor(p), f=fract(p), w=f*f*(3.0-2.0*f);
  float a=hash21(i), b=hash21(i+vec2(1,0)), c=hash21(i+vec2(0,1)), d=hash21(i+vec2(1,1));
  return mix(mix(a,b,w.x), mix(c,d,w.x), w.y); }
float fbm(vec2 p){ float s=0.0, amp=0.5; mat2 m=mat2(1.6,1.2,-1.2,1.6);
  for(int k=0;k<5;k++){ s+=amp*vnoise(p); p=m*p; amp*=0.5; } return s; }
void main(){
  vec2 px = vUv*uSize.xy; float md = max(min(uSize.x,uSize.y),1.0);
  float intensity=uLook.x, scl=uLook.y, ang=uLook.z, soft=uLook.w, t=uMisc.x, seed=uMisc.y, grain=uMisc.z, density=uMisc.w;
  vec2 p = px/md*2.2/scl;
  float ca=cos(ang), sa=sin(ang);
  p = vec2(ca*p.x - sa*p.y, sa*p.x + ca*p.y);
  p = vec2(p.x*0.55, p.y);
  vec2 s = vec2(seed*1.37, seed*0.71);
  vec2 q = vec2(fbm(p+s+vec2(t*0.05,0.0)), fbm(p+s+vec2(5.2,1.3)-vec2(0.0,t*0.04)));
  float edge = 0.62 - density*0.22;
  float bw = mix(0.015, 0.22, soft);
  float m1 = smoothstep(edge-bw, edge+bw, fbm(p*1.4 + 2.2*q + s));
  float m2 = smoothstep(edge-bw*2.0, edge+bw*2.0, fbm(p*0.65 + 1.5*q + s*1.7 + vec2(10.0,3.0)))*0.55;
  float r = 1.0 - abs(fbm(p*vec2(0.6,1.6) + q + s + vec2(20.0,7.0))*2.0 - 1.0);
  float br = smoothstep(0.93 - bw*0.3, 0.985, r)*0.45;
  float shadow = clamp(max(m1,m2)+br, 0.0, 1.0);
  float g = dot(vUv - vec2(0.5), normalize(vec2(-1.0,1.0)));
  shadow *= clamp(1.0 + g*uSize.z, 0.0, 1.0);
  vec3 col = mix(uBase, uShade, shadow*intensity);
  col += vec3((hash21(px + s*13.0) - 0.5)*grain);
  gl_FragColor = vec4(clamp(col,0.0,1.0), 1.0);
}`;

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
  return shader;
}

function createProgram(gl) {
  const program = gl.createProgram();
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  return program;
}

/* a CSS color token as WebGL wants it: three numbers from 0 to 1 */
function cssColor(name, fallback) {
  const value = getComputedStyle(root).getPropertyValue(name).trim();
  const match = value.match(/^#([0-9a-f]{6})$/i);
  const n = parseInt(match ? match[1] : fallback, 16);
  return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
}

function currentSeed() {
  const view = document.querySelector('.view:not([hidden])');
  return SEEDS[view ? view.dataset.view : 'home'] ?? SEEDS.home;
}

export function initBackground() {
  const canvas = document.getElementById('leaf-bg');
  const gl = canvas?.getContext('webgl', { antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: false });
  if (!gl) return;
  let program;
  try { program = createProgram(gl); } catch { return; }

  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'p');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const uniform = (name) => gl.getUniformLocation(program, name);
  const u = { base: uniform('uBase'), shade: uniform('uShade'), look: uniform('uLook'), misc: uniform('uMisc'), size: uniform('uSize') };

  const isStill = () => reducedMotion.matches || root.hasAttribute('data-motion-paused');
  let start = performance.now();
  let frozenAt = 0;                               /* scene time shown while paused */
  let pausedAt = root.hasAttribute('data-motion-paused') ? start : 0;
  let colors = null;
  let seed = currentSeed();

  function draw(now) {
    const moving = !isStill();
    const dpr = Math.min(window.devicePixelRatio || 1, moving ? 1.5 : 2); /* lighter while animating */
    const width = Math.max(1, Math.round(window.innerWidth * dpr));
    const height = Math.max(1, Math.round(window.innerHeight * dpr));
    if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
    gl.viewport(0, 0, width, height);

    colors ??= [cssColor('--leaf-base', 'ebe9e5'), cssColor('--leaf-shade', 'd3d2ce')];
    gl.uniform3f(u.base, ...colors[0]);
    gl.uniform3f(u.shade, ...colors[1]);
    gl.uniform4f(u.look, 0.85, 1.0, -35 * Math.PI / 180, 0.55);  /* intensity, scale, light angle, softness */
    if (moving) frozenAt = ((now || performance.now()) - start) / 1000;
    const time = reducedMotion.matches ? 0 : frozenAt;
    gl.uniform4f(u.misc, time, seed, 0.01, 0.5);                 /* time, seed, grain, density */
    gl.uniform3f(u.size, width, height, 0.6);                    /* width, height, light falloff */
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  let frame = 0;
  let lastFrame = 0;
  function loop(now) {
    frame = 0;
    if (document.hidden) return;
    if (now - lastFrame >= FRAME_MS) { lastFrame = now; draw(now); }
    if (!isStill()) frame = requestAnimationFrame(loop);
  }
  const kick = () => { if (!frame) frame = requestAnimationFrame(loop); };

  /* colors, page or size changed: draw again (once if still, otherwise keep animating) */
  function redraw() {
    colors = null;
    seed = currentSeed();
    if (isStill()) requestAnimationFrame(draw);
    else { lastFrame = 0; kick(); }
  }

  function onMotionChange({ detail }) {
    if (detail.paused) {
      pausedAt = performance.now();
      if (frame) { cancelAnimationFrame(frame); frame = 0; }
    } else {
      if (pausedAt) start += performance.now() - pausedAt; /* resume where it stopped */
      pausedAt = 0;
      lastFrame = 0;
      kick();
    }
  }

  window.addEventListener('resize', redraw);
  reducedMotion.addEventListener('change', redraw);
  on('cpv:themechange', redraw);
  on('cpv:routechange', redraw);
  on('cpv:motionchange', onMotionChange);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) kick(); });
  canvas.addEventListener('webglcontextlost', (event) => { event.preventDefault(); canvas.hidden = true; });

  draw();
  kick();
  canvas.hidden = false;
}

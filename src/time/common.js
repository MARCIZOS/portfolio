import * as THREE from "three";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";

/* Small helpers shared by every scene. */

export const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

/** Seeded random, so scenes look the same on every visit. */
export function rng(seed = 1) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function mat(color, { metal = 0.1, rough = 0.6, emissive = 0x000000, ei = 0, opacity = 1 } = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    metalness: metal,
    roughness: rough,
    emissive,
    emissiveIntensity: ei,
    transparent: opacity < 1,
    opacity,
  });
}

export function glow(color, opacity = 1) {
  return new THREE.MeshBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false });
}

export function box(w, h, d, material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  m.position.set(x, y, z);
  return m;
}

/** Many boxes of one material in one draw call. items: [{x,y,z,w,h,d,color?}] */
export function boxes(items, material) {
  const geo = new THREE.BoxGeometry(1, 1, 1);
  const mesh = new THREE.InstancedMesh(geo, material, items.length);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const c = new THREE.Color();
  items.forEach((b, i) => {
    m.compose(V(b.x, b.y, b.z), q, V(b.w, b.h, b.d));
    mesh.setMatrixAt(i, m);
    if (b.color !== undefined) mesh.setColorAt(i, c.set(b.color));
  });
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  return mesh;
}

/** A line through points. */
export function line(points, color, opacity = 1) {
  const g = new THREE.BufferGeometry().setFromPoints(points);
  return new THREE.Line(g, new THREE.LineBasicMaterial({ color, transparent: opacity < 1, opacity }));
}

/** A flat tube along points (reads better than 1px lines at a distance). */
export function tube(points, radius, material) {
  const curve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0);
  return new THREE.Mesh(new THREE.TubeGeometry(curve, Math.max(8, points.length * 8), radius, 6, false), material);
}

/**
 * Glowing pulses running along polylines.
 * lines: [{ pts: Vector3[], speed, count }]
 */
export function pulses(lines, { size = 0.12, color = 0xffb000 } = {}) {
  const total = lines.reduce((n, l) => n + (l.count || 1), 0);
  const mesh = new THREE.InstancedMesh(new THREE.SphereGeometry(size, 10, 8), glow(color), total);
  const tracks = lines.map((l) => {
    const lens = [0];
    for (let i = 1; i < l.pts.length; i += 1) lens.push(lens[i - 1] + l.pts[i].distanceTo(l.pts[i - 1]));
    return { ...l, lens, len: lens[lens.length - 1] };
  });
  const m = new THREE.Matrix4();
  const p = new THREE.Vector3();
  function at(t, d) {
    const x = (d % t.len + t.len) % t.len;
    let i = 1;
    while (i < t.lens.length - 1 && t.lens[i] < x) i += 1;
    const k = (x - t.lens[i - 1]) / Math.max(1e-6, t.lens[i] - t.lens[i - 1]);
    return p.copy(t.pts[i - 1]).lerp(t.pts[i], k);
  }
  function update(time) {
    let n = 0;
    for (const t of tracks) {
      const c = t.count || 1;
      for (let j = 0; j < c; j += 1) {
        m.makeTranslation(at(t, time * (t.speed || 1) + (j * t.len) / c));
        mesh.setMatrixAt(n, m);
        n += 1;
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
  }
  update(0);
  return { mesh, update };
}

/** An HTML label anchored in 3D. Shown only when its scene is framed. */
export function label(text, pos, cls = "") {
  const el = document.createElement("div");
  el.className = `tag ${cls}`;
  el.textContent = text;
  const o = new CSS2DObject(el);
  o.position.copy(pos);
  return o;
}

/** A texture drawn with the 2D canvas API. Call .redraw() to repaint. */
export function canvasTex(w, h, draw) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.redraw = (...args) => {
    draw(ctx, w, h, ...args);
    tex.needsUpdate = true;
  };
  tex.redraw(0);
  return tex;
}

/** A flat panel showing a canvas texture. */
export function screen(w, h, tex, emissive = 1) {
  const m = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
  m.color.setScalar(emissive);
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
}

export const C = {
  amber: 0xffb000,
  cyan: 0x5fd4f5,
  sunset: 0xff7a59,
  crimson: 0xff5a36,
  green: 0x7be38a,
  ink: 0xf2eee6,
  line: 0x2a2621,
  ground: 0x14120f,
};

export const smooth = (k) => k * k * (3 - 2 * k);
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

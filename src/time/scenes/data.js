import * as THREE from "three";
import { V, rng, mat, glow, box, tube, label, canvasTex, C, clamp } from "../common.js";

/* Milliseconds: a FAISS vector search over past incidents, and a blink. */

/* ------------------------------------------------------------ 04 · 1 ms */
export function vectors() {
  const g = new THREE.Group();
  const rand = rng(11);
  const Q = V(1.6, 0.4, 1.2);
  const n = 1700;
  const pos = new Float32Array(n * 3);
  const colors = new Float32Array(n * 3);
  const c = new THREE.Color();
  for (let i = 0; i < n; i += 1) {
    let p;
    do {
      p = V((rand() - 0.5) * 2, (rand() - 0.5) * 2, (rand() - 0.5) * 2);
    } while (p.lengthSq() > 1);
    p.multiplyScalar(6.2);
    if (p.distanceTo(Q) < 1.4) p.add(p.clone().sub(Q).normalize().multiplyScalar(1.5));
    pos.set([p.x, p.y, p.z], i * 3);
    c.setHSL(0.52 + rand() * 0.06, 0.7, 0.45 + rand() * 0.3);
    colors.set([c.r, c.g, c.b], i * 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const pm = new THREE.PointsMaterial({ size: 0.1, vertexColors: true, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
  g.add(new THREE.Points(geo, pm));

  // Faint orbit rings give the cloud a shape.
  for (const [rx, ry] of [[Math.PI / 2, 0], [0.4, 0.6], [1.2, -0.5]]) {
    const r = new THREE.Mesh(new THREE.TorusGeometry(6.4, 0.012, 6, 160), glow(0x3a6e80, 0.5));
    r.rotation.set(rx, ry, 0);
    g.add(r);
  }

  // The query point and its three nearest neighbours.
  const qRing = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.025, 8, 64), glow(C.amber, 0.9));
  qRing.position.copy(Q);
  g.add(qRing);
  const nbrs = [V(3.4, 1.9, 0.2), V(0.1, 2.2, 2.6), V(3.1, -1.4, 2.4)];
  const names = ["INC-0412 · connection pool exhausted", "INC-0388 · worker OOM-killed", "INC-0291 · slow query on jobs table"];
  const lines = [];
  nbrs.forEach((p, i) => {
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), glow(C.amber));
    s.position.copy(p);
    g.add(s);
    const t = tube([Q.clone().add(p.clone().sub(Q).normalize().multiplyScalar(0.8)), p], 0.025, glow(C.amber, 0.85));
    g.add(t);
    lines.push({ t, s, count: t.geometry.index.count });
    g.add(label(names[i], p.clone().add(V(0, 0.5, 0)), "small"));
  });
  g.add(label("your error  →  k = 3 nearest", Q.clone().add(V(0, 1.2, 0)), "accent"));
  g.add(label("example incidents", V(-4.5, 4.6, 0), "small dim"));

  return {
    id: "vectors",
    group: g,
    view: { center: V(0.8, 0.3, 0.5), dist: 21, dir: V(0.5, 0.35, 1) },
    slot: { pos: Q, scale: 0.05 },
    update(dt, t) {
      const k = t % 4;
      lines.forEach((l, i) => {
        const a = clamp((k - 0.4 - i * 0.12) / 0.5, 0, 1);
        l.t.geometry.setDrawRange(0, Math.floor(l.count * a));
        const pulse = a >= 1 ? 1 + 0.35 * Math.max(0, Math.sin((k - 1) * 8)) * (k < 2 ? 1 : 0) : 0.6;
        l.s.scale.setScalar(pulse);
      });
      qRing.rotation.y = t * 0.8;
      // Point size doesn't follow the holder's scale, so apply it by hand.
      pm.size = (0.1 + 0.015 * Math.sin(t * 1.3)) * (g.parent ? g.parent.scale.x : 1);
    },
  };
}

/* ---------------------------------------------------------- 06 · 300 ms */
export function blink() {
  const g = new THREE.Group();
  const R = 5;
  g.add(new THREE.Mesh(new THREE.SphereGeometry(R, 64, 48), mat(0xe8e2d6, { rough: 0.35, metal: 0, emissive: 0x2a2620, ei: 0.4 })));
  // Iris: a spherical cap with a painted texture.
  const irisTex = canvasTex(512, 512, (c, w, h) => {
    const grd = c.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, w / 2);
    grd.addColorStop(0, "#3a2408");
    grd.addColorStop(0.35, "#b36b00");
    grd.addColorStop(0.75, "#ffb000");
    grd.addColorStop(1, "#5a3a10");
    c.fillStyle = grd;
    c.fillRect(0, 0, w, h);
    c.strokeStyle = "rgba(40,20,0,0.5)";
    for (let i = 0; i < 180; i += 1) {
      const a = (i / 180) * Math.PI * 2;
      c.beginPath();
      c.moveTo(w / 2 + Math.cos(a) * 60, h / 2 + Math.sin(a) * 60);
      c.lineTo(w / 2 + Math.cos(a) * 250, h / 2 + Math.sin(a) * 250);
      c.stroke();
    }
  });
  const cap = (r, ang, material) => {
    const geo = new THREE.SphereGeometry(r, 64, 16, 0, Math.PI * 2, 0, ang);
    geo.rotateX(Math.PI / 2);
    return new THREE.Mesh(geo, material);
  };
  const iris = cap(R + 0.02, Math.asin(2 / R), new THREE.MeshStandardMaterial({ map: irisTex, roughness: 0.3, emissive: 0x5a3500, emissiveIntensity: 0.5 }));
  g.add(iris);
  const pupil = cap(R + 0.04, Math.asin(0.95 / R), new THREE.MeshStandardMaterial({ color: 0x050403, roughness: 0.2 }));
  g.add(pupil);
  const shine = new THREE.Mesh(new THREE.CircleGeometry(0.28, 24), glow(0xffffff, 0.8));
  shine.position.set(1.1, 1.0, R - 0.05);
  g.add(shine);
  // Eyelids: two shells that close over the eye.
  const lidMat = mat(0x2b241e, { rough: 0.8, metal: 0 });
  const lidGeo = new THREE.SphereGeometry(R + 0.35, 64, 24, 0, Math.PI * 2, 0, Math.PI / 2);
  const top = new THREE.Mesh(lidGeo, lidMat);
  const bot = new THREE.Mesh(lidGeo, lidMat);
  bot.rotation.x = Math.PI;
  const lids = new THREE.Group();
  lids.add(top, bot);
  g.add(lids);
  g.add(label("one blink ≈ 300 ms", V(0, R + 1.4, 0), "accent"));

  return {
    id: "blink",
    group: g,
    view: { center: V(0, 0, 0), dist: 20, dir: V(0.3, 0.22, 1) },
    slot: { pos: V(0, 0, R + 0.75), scale: 0.045 },
    update(dt, t) {
      // Open most of the time; a 300 ms blink every 4 s.
      const k = t % 4;
      const closed = k > 3.7 ? Math.sin(((k - 3.7) / 0.3) * Math.PI) : 0;
      const open = 1.25 * (1 - closed);
      top.rotation.x = -open;
      bot.rotation.x = Math.PI + open;
    },
  };
}

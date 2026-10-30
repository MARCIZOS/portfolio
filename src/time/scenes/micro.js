import * as THREE from "three";
import { V, rng, mat, glow, box, boxes, tube, pulses, label, C } from "../common.js";

/* The three shortest timescales: a cache hit inside a CPU core (1 ns),
 * a read from RAM (100 ns), and a Redis GET (1 µs). */

/* ------------------------------------------------------------ 01 · 1 ns */
export function core() {
  const g = new THREE.Group();
  const rand = rng(3);
  g.add(box(12, 0.4, 12, mat(0x182030, { metal: 0.35, rough: 0.45 }), 0, -0.2, 0));
  const grid = new THREE.GridHelper(12, 24, 0x2b3a52, 0x202a3a);
  grid.position.y = 0.004;
  g.add(grid);

  // Functional blocks.
  const blocks = [
    { name: "ALU", x: -3, z: -2.6, w: 3.6, d: 2.8, h: 0.5, c: 0x2c5878 },
    { name: "Decoder", x: 2.7, z: -3, w: 3.2, d: 2.2, h: 0.4, c: 0x4a3e6c },
    { name: "Registers", x: -3.2, z: 2.6, w: 3.2, d: 2.6, h: 0.12, c: 0x234a4a },
    { name: "L1 cache", x: 2.7, z: 2.4, w: 4.4, d: 3.8, h: 0.12, c: 0x2f3542 },
  ];
  for (const b of blocks) {
    g.add(box(b.w, b.h, b.d, mat(b.c, { metal: 0.3, rough: 0.5, emissive: b.c, ei: 0.25 }), b.x, b.h / 2, b.z));
    g.add(label(b.name, V(b.x, b.h + 0.5, b.z - b.d / 2 - 0.2), "small"));
  }
  // Register file: a grid of small cells.
  const regs = [];
  for (let i = 0; i < 6; i += 1) for (let j = 0; j < 4; j += 1) regs.push({ x: -4.4 + i * 0.48, y: 0.24, z: 1.7 + j * 0.6, w: 0.36, h: 0.22, d: 0.44 });
  g.add(boxes(regs, mat(0x3d8a8a, { metal: 0.4, rough: 0.4, emissive: 0x2a6a6a, ei: 0.5 })));
  // L1 cache: 8 x 6 lines of tiles; one line is the hit.
  const tiles = [];
  for (let r = 0; r < 6; r += 1) for (let k = 0; k < 8; k += 1) if (r !== 3) tiles.push({ x: 0.85 + k * 0.52, y: 0.2, z: 0.95 + r * 0.58, w: 0.42, h: 0.1, d: 0.42 });
  g.add(boxes(tiles, mat(0x4a5266, { metal: 0.5, rough: 0.4 })));
  const hitMat = mat(C.cyan, { emissive: C.cyan, ei: 1.2 });
  const hit = boxes(Array.from({ length: 8 }, (_, k) => ({ x: 0.85 + k * 0.52, y: 0.22, z: 0.95 + 3 * 0.58, w: 0.42, h: 0.14, d: 0.42 })), hitMat);
  g.add(hit);
  g.add(label("cache hit · 1 ns", V(2.7, 0.9, 2.7), "accent"));

  // Wires between blocks, with pulses running along them.
  const wireMat = mat(0xb07a3a, { metal: 0.9, rough: 0.3 });
  const paths = [
    [V(2.7, 0.06, 0.4), V(2.7, 0.06, -0.2), V(-3, 0.06, -0.2), V(-3, 0.06, -1.1)],
    [V(-3.2, 0.06, 1.2), V(-3.2, 0.06, -1.1)],
    [V(1, 0.06, -3), V(-1.1, 0.06, -3)],
    [V(4.3, 0.06, -1.8), V(4.3, 0.06, 0.4)],
    [V(-5.5, 0.06, -5), V(-5.5, 0.06, 5)],
    [V(5.6, 0.06, -5), V(5.6, 0.06, 5)],
  ];
  paths.forEach((p) => g.add(tube(p, 0.05, wireMat)));
  const pul = pulses(paths.map((pts, i) => ({ pts, speed: 1.4 + (i % 3) * 0.4, count: 2 + (i % 2) })), { size: 0.1, color: C.cyan });
  g.add(pul.mesh);
  // Scattered vias.
  const vias = [];
  for (let i = 0; i < 120; i += 1) vias.push({ x: (rand() - 0.5) * 11.4, y: 0.02, z: (rand() - 0.5) * 11.4, w: 0.08, h: 0.04, d: 0.08 });
  g.add(boxes(vias, mat(0xc9a060, { metal: 0.9, rough: 0.3 })));

  return {
    id: "core",
    group: g,
    view: { center: V(0, 0, 0.3), dist: 21, dir: V(0.25, 1, 0.85) },
    slot: { pos: V(), scale: 1 },
    update(dt, t) {
      pul.update(t);
      hitMat.emissiveIntensity = 0.7 + 0.7 * Math.max(0, Math.sin(t * 2.4));
    },
  };
}

/* ---------------------------------------------------------- 02 · 100 ns */
export function dram() {
  const g = new THREE.Group();
  g.add(box(16, 0.3, 5.2, mat(0x174a30, { metal: 0.2, rough: 0.6 }), 0, 0, 0));
  // Gold contacts along the front edge.
  const pins = [];
  for (let i = 0; i < 60; i += 1) pins.push({ x: -7.4 + i * 0.25, y: 0.16, z: 2.35, w: 0.16, h: 0.02, d: 0.45 });
  g.add(boxes(pins, mat(0xd4af6a, { metal: 0.95, rough: 0.25 })));
  // Seven chips; the middle one is where the cache hit sits.
  const chipMat = mat(0x111214, { metal: 0.3, rough: 0.4 });
  const bands = [];
  const busPaths = [];
  for (let i = 0; i < 7; i += 1) {
    const x = -6 + i * 2;
    g.add(box(1.5, 0.3, 2, chipMat, x, 0.3, -0.4));
    const bm = mat(0x16181c, { emissive: C.cyan, ei: 0, metal: 0.5, rough: 0.35 });
    const b = box(1.3, 0.02, 1.8, bm, x, 0.46, -0.4);
    g.add(b);
    bands.push({ x, m: bm });
    busPaths.push([V(x, 0.17, 0.65), V(x, 0.17, 1.4), V(x * 0.2, 0.17, 1.9), V(x * 0.2, 0.17, 2.2)]);
  }
  const traceMat = mat(0xb07a3a, { metal: 0.85, rough: 0.35 });
  busPaths.forEach((p) => g.add(tube(p, 0.035, traceMat)));
  const pul = pulses(busPaths.map((pts) => ({ pts, speed: 2.2, count: 2 })), { size: 0.09, color: C.amber });
  g.add(pul.mesh);
  g.add(label("DRAM bank · row open", V(-4, 1.1, -1.4), "small"));
  g.add(label("64-bit bus", V(4.2, 0.7, 1.7), "small"));
  g.add(label("the cache hit lives here", V(0, 1.4, -1.6), "accent"));

  return {
    id: "dram",
    group: g,
    view: { center: V(0, 0, 0), dist: 21, dir: V(0.2, 0.95, 0.85) },
    slot: { pos: V(0, 0.5, -0.4), scale: 0.1 },
    update(dt, t) {
      pul.update(t);
      // A refresh wave sweeps across the chips.
      const sweep = ((t * 4) % 20) - 10;
      for (const b of bands) b.m.emissiveIntensity = Math.max(0, 1 - Math.abs(b.x - sweep) / 1.6) * 0.9;
    },
  };
}

/* ------------------------------------------------------------ 03 · 1 µs */
export function keyspace() {
  const g = new THREE.Group();
  g.add(box(13.4, 0.3, 13.4, mat(0x15140f, { metal: 0.2, rough: 0.7 }), 0, -0.15, 0));
  const N = 15;
  const step = 0.82;
  const cells = [];
  for (let i = 0; i < N; i += 1) {
    for (let j = 0; j < N; j += 1) {
      const x = (i - (N - 1) / 2) * step;
      const z = (j - (N - 1) / 2) * step;
      if (Math.abs(x) < 1.3 && Math.abs(z) < 1.3) continue;
      cells.push({ x, y: 0.06, z, w: 0.64, h: 0.12, d: 0.64, color: 0x2a2621 });
    }
  }
  const tileMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.2, roughness: 0.5, emissive: 0xffffff, emissiveIntensity: 0.0 });
  const tiles = boxes(cells, tileMat);
  g.add(tiles);
  const dist = cells.map((c) => Math.hypot(c.x, c.z));
  // The key being read: a raised pad.
  g.add(box(1.9, 0.3, 1.9, mat(0x2a2116, { metal: 0.4, rough: 0.4, emissive: C.amber, ei: 0.15 }), 0, 0.15, 0));
  const ring = new THREE.Mesh(new THREE.RingGeometry(1.25, 1.33, 64), glow(C.amber, 0.9));
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.02;
  g.add(ring);
  g.add(label("GET skills  →  0.9 µs", V(0, 0.9, -1.4), "accent"));
  const names = [
    ["skills:languages", -4.1, -4.1],
    ["skills:backend", 4.1, -3.3],
    ["skills:data", -4.9, 2.5],
    ["skills:cloud", 3.3, 4.1],
    ["skills:core-cs", 0.8, 5.7],
  ];
  names.forEach(([n, x, z]) => g.add(label(n, V(x, 0.5, z), "small")));

  const col = new THREE.Color();
  const base = new THREE.Color(0x2a2621);
  const hot = new THREE.Color(C.amber);
  const keyHot = names.map(([, x, z]) => cells.findIndex((c) => Math.abs(c.x - x) < 0.5 && Math.abs(c.z - z) < 0.5));

  return {
    id: "keyspace",
    group: g,
    view: { center: V(0, 0, 0), dist: 20, dir: V(0.35, 1, 0.9) },
    slot: { pos: V(0, 0.32, 0), scale: 0.08 },
    update(dt, t) {
      const r = (t % 2.4) * 4;
      for (let i = 0; i < cells.length; i += 1) {
        const k = Math.exp(-((dist[i] - r) ** 2) / 0.35) * 0.9;
        col.copy(base).lerp(hot, k);
        if (keyHot.includes(i)) col.lerp(hot, 0.55);
        tiles.setColorAt(i, col);
      }
      tiles.instanceColor.needsUpdate = true;
      ring.scale.setScalar(1 + (t % 1.2) * 0.25);
      ring.material.opacity = 0.9 - (t % 1.2) * 0.7;
    },
  };
}

import * as THREE from "three";
import { V, rng, mat, glow, box, tube, label, canvasTex, screen, C, clamp } from "../common.js";

const at = (m, x, y, z) => {
  m.position.set(x, y, z);
  return m;
};

/* Hours to years: a LeetCode contest (90 min), a hackathon (1 day), an
 * internship (2 months), a market stress year (1 year), and the degree
 * (4 years). */

/* ------------------------------------------------------- 09 · 90 minutes */
export function contest(stats) {
  const g = new THREE.Group();
  const R = 5;
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(R + 0.35, R + 0.35, 0.6, 96), mat(0x2a2620, { metal: 0.85, rough: 0.3 })));
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.9, 24), mat(0x3a352e, { metal: 0.9, rough: 0.3 }));
  crown.rotation.x = Math.PI / 2;
  crown.position.set(0, 0, -R - 0.7);
  g.add(crown);
  const faceTex = canvasTex(1024, 1024, (c, w, h, sweep = 0) => {
    const cx = w / 2;
    c.fillStyle = "#0f0d0b";
    c.fillRect(0, 0, w, h);
    // Elapsed arc.
    c.strokeStyle = "rgba(255,176,0,0.85)";
    c.lineWidth = 34;
    c.beginPath();
    c.arc(cx, cx, 400, -Math.PI / 2, -Math.PI / 2 + sweep * Math.PI * 2);
    c.stroke();
    for (let m = 0; m < 90; m += 1) {
      const a = -Math.PI / 2 + (m / 90) * Math.PI * 2;
      const big = m % 15 === 0;
      c.strokeStyle = big ? "#f2eee6" : "#5a544a";
      c.lineWidth = big ? 8 : 3;
      c.beginPath();
      c.moveTo(cx + Math.cos(a) * (big ? 440 : 462), cx + Math.sin(a) * (big ? 440 : 462));
      c.lineTo(cx + Math.cos(a) * 490, cx + Math.sin(a) * 490);
      c.stroke();
      if (big) {
        c.fillStyle = "#c9c2b6";
        c.font = "600 46px JetBrains Mono, monospace";
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillText(String(m), cx + Math.cos(a) * 360, cx + Math.sin(a) * 360);
      }
    }
    c.fillStyle = "#948c80";
    c.font = "500 34px JetBrains Mono, monospace";
    c.fillText("MINUTES", cx, cx + 230);
  });
  const face = new THREE.Mesh(new THREE.CircleGeometry(R, 96), new THREE.MeshBasicMaterial({ map: faceTex, toneMapped: false }));
  face.rotation.x = -Math.PI / 2;
  face.position.y = 0.31;
  g.add(face);
  const hand = new THREE.Group();
  const hm = box(0.12, 0.06, 4.0, glow(C.amber), 0, 0, -2.8);
  hand.add(hm);
  hand.position.y = 0.36;
  g.add(hand);

  // Scoreboard card with his real numbers.
  const cardTex = canvasTex(1024, 560, (c, w, h) => {
    const s = stats.leetcode;
    c.fillStyle = "#12100d";
    c.fillRect(0, 0, w, h);
    c.strokeStyle = "#ffb000";
    c.lineWidth = 6;
    c.strokeRect(3, 3, w - 6, h - 6);
    c.fillStyle = "#948c80";
    c.font = "600 40px JetBrains Mono, monospace";
    c.fillText("LEETCODE · CONTEST RATING", 56, 92);
    c.fillStyle = "#ffb000";
    c.font = "800 230px Archivo, sans-serif";
    c.fillText(String(s.rating), 50, 330);
    c.fillStyle = "#f2eee6";
    c.font = "600 52px Archivo, sans-serif";
    c.fillText(`${s.badge} · ${s.solved} problems solved`, 56, 450);
  });
  const card = screen(6.6, 3.6, cardTex, 1);
  card.position.set(0, 3.6, -R - 1.2);
  card.rotation.x = -0.35;
  g.add(card);

  return {
    id: "contest",
    group: g,
    view: { center: V(0, 1.2, -1.2), dist: 21, dir: V(0.22, 1, 0.85) },
    slot: { pos: V(0, 0.33 + 14 * 0.045 * 0 + 0.012, 0), scale: 0.045 },
    refresh() {
      cardTex.redraw();
    },
    update(dt, t) {
      const sweep = (t % 9) / 9;
      hand.rotation.y = -sweep * Math.PI * 2;
      faceTex.redraw(sweep);
    },
  };
}

/* ----------------------------------------------------------- 10 · 1 day */
export function hackathon() {
  const g = new THREE.Group();
  const floor = new THREE.Mesh(new THREE.CylinderGeometry(10, 10, 0.2, 96), mat(0x12100d, { rough: 0.8 }));
  floor.position.y = -0.1;
  g.add(floor);
  // Round table.
  g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.2, 0.15, 64), mat(0x2e271f, { rough: 0.55 })), 0, 1.0, 0));
  g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.4, 1, 16), mat(0x2e271f)), 0, 0.5, 0));
  // Four laptops facing the centre.
  const codeTex = canvasTex(256, 160, (c, w, h) => {
    c.fillStyle = "#0d1117";
    c.fillRect(0, 0, w, h);
    const r = rng(5);
    for (let i = 0; i < 9; i += 1) {
      c.fillStyle = ["#5fd4f5", "#ffb000", "#7be38a", "#c9c2b6"][i % 4];
      c.fillRect(14 + (i % 3) * 10, 14 + i * 15, 40 + r() * 150, 7);
    }
  });
  for (let i = 0; i < 4; i += 1) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const lap = new THREE.Group();
    lap.add(box(1.1, 0.05, 0.75, mat(0x8f887c, { metal: 0.8, rough: 0.3 }), 0, 0, 0));
    const scr = screen(1.1, 0.7, codeTex, 1.1);
    scr.position.set(0, 0.36, -0.38);
    scr.rotation.x = -0.25;
    lap.add(scr);
    lap.position.set(Math.cos(a) * 2.3, 1.1, Math.sin(a) * 2.3);
    lap.lookAt(0, 1.1, 0);
    lap.rotateY(Math.PI);
    g.add(lap);
    const chair = box(0.9, 1.0, 0.9, mat(0x1d1a16, { rough: 0.7 }), Math.cos(a) * 4.3, 0.5, Math.sin(a) * 4.3);
    g.add(chair);
  }
  // Coffee cups (a hackathon essential).
  for (const [x, z] of [[1.4, 1.5], [-1.6, 1.1], [1.1, -1.7]]) {
    g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.11, 0.3, 16), mat(0xf2eee6, { rough: 0.5 })), x, 1.23, z));
  }
  // The sky: sun and moon on one arc.
  const arcPts = [];
  for (let i = 0; i <= 64; i += 1) {
    const a = Math.PI * (i / 64);
    arcPts.push(V(Math.cos(a) * 9, Math.sin(a) * 7, -5));
  }
  g.add(tube(arcPts, 0.03, glow(0x5a544a, 0.6)));
  const sun = new THREE.Mesh(new THREE.SphereGeometry(0.75, 32, 24), glow(C.amber));
  const sunHalo = new THREE.Mesh(new THREE.SphereGeometry(1.3, 24, 16), glow(C.sunset, 0.18));
  sun.add(sunHalo);
  const moon = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 24), glow(0xdfe6f0, 0.95));
  g.add(sun, moon);
  const sunLight = new THREE.PointLight(C.amber, 30, 30, 1.6);
  sun.add(sunLight);
  g.add(label("Grand Prize · Contata NCR 2026", V(0, 3.6, 0), "accent"));
  g.add(label("Top 10 of 120+ · HackO'Clock", V(-3.6, 2.2, 1.8), "small"));
  g.add(label("Nebius × NVIDIA Global AI Hackathon", V(3.4, 1.7, 2.6), "small"));

  return {
    id: "hackathon",
    group: g,
    view: { center: V(0, 2.6, 0), dist: 23, dir: V(0.3, 0.45, 1) },
    slot: { pos: V(0, 1.075 + 0.3 * 0.05 + 0.004, 0), scale: 0.05 },
    update(dt, t) {
      const k = (t % 8) / 8;
      const a = Math.PI * 2 * k;
      sun.position.set(Math.cos(a) * 9, Math.sin(a) * 7, -5);
      moon.position.set(-Math.cos(a) * 9, -Math.sin(a) * 7, -5);
      sun.visible = sun.position.y > -0.5;
      moon.visible = moon.position.y > -0.5;
      sunLight.intensity = Math.max(0, sun.position.y) * 6;
    },
  };
}

/* ------------------------------------------------------- 11 · 2 months */
function monthTex(name, year, month, highlight) {
  return canvasTex(512, 560, (c, w, h) => {
    c.fillStyle = "#f2eee6";
    c.fillRect(0, 0, w, h);
    c.fillStyle = highlight ? "#ffb000" : "#5a544a";
    c.fillRect(0, 0, w, 110);
    c.fillStyle = "#0a0908";
    c.font = "800 56px Archivo, sans-serif";
    c.fillText(`${name} ${year}`, 32, 76);
    const days = ["M", "T", "W", "T", "F", "S", "S"];
    c.font = "600 26px JetBrains Mono, monospace";
    days.forEach((d, i) => {
      c.fillStyle = "#5a544a";
      c.fillText(d, 40 + i * 66, 160);
    });
    const first = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
    const n = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    c.font = "600 30px JetBrains Mono, monospace";
    for (let d = 1; d <= n; d += 1) {
      const idx = first + d - 1;
      const x = 34 + (idx % 7) * 66;
      const y = 220 + Math.floor(idx / 7) * 62;
      if (highlight && idx % 7 < 5) {
        c.fillStyle = "rgba(255,176,0,0.22)";
        c.fillRect(x - 10, y - 34, 56, 46);
      }
      c.fillStyle = idx % 7 >= 5 ? "#948c80" : "#0a0908";
      c.fillText(String(d), x, y);
    }
  });
}

export function calendar() {
  const g = new THREE.Group();
  g.add(box(16, 0.2, 10, mat(0x12100d, { rough: 0.8 }), 0, -0.1, 0));
  const stand = mat(0x2a241d, { rough: 0.6 });
  g.add(box(12.4, 0.3, 1.6, stand, 0, 0.15, -0.4));
  const pages = [
    ["July", 6, -3.05],
    ["August", 7, 3.05],
  ];
  pages.forEach(([n, m, x]) => {
    const p = screen(5.6, 6.1, monthTex(n, 2024, m, true), 1);
    p.position.set(x, 3.4, -0.3);
    p.rotation.x = -0.12;
    g.add(p);
    // Ring binding.
    for (let i = 0; i < 6; i += 1) {
      const r = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.04, 8, 20), mat(0x8f887c, { metal: 0.9, rough: 0.3 }));
      r.position.set(x - 2.2 + i * 0.88, 6.5, -0.38);
      g.add(r);
    }
  });
  // June tears off the front of July, over and over.
  const juneTex = monthTex("June", 2024, 5, false);
  const geo = new THREE.PlaneGeometry(5.6, 6.1);
  geo.translate(0, -3.05, 0);
  const june = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: juneTex, transparent: true, side: THREE.DoubleSide, toneMapped: false }));
  const pivot = new THREE.Group();
  pivot.position.set(-3.05, 6.45, -0.2);
  pivot.rotation.x = -0.12;
  pivot.add(june);
  g.add(pivot);
  g.add(label("LetsGrowMore · Python Developer", V(0, 7.3, -0.3), "accent"));

  return {
    id: "calendar",
    group: g,
    view: { center: V(0, 3, 0.8), dist: 21, dir: V(0.15, 0.28, 1) },
    slot: { pos: V(0, 0.006, 3.4), scale: 0.05 },
    update(dt, t) {
      const k = (t % 3.5) / 3.5;
      const a = clamp((k - 0.35) / 0.4, 0, 1);
      june.position.set(a * 1.2, -a * 5, a * 2.4);
      june.rotation.set(a * 1.4, a * 0.6, a * 0.8);
      june.material.opacity = 1 - clamp((k - 0.6) / 0.15, 0, 1);
      june.visible = k < 0.8;
    },
  };
}

/* --------------------------------------------------------- 12 · 1 year */
export function market() {
  const g = new THREE.Group();
  g.add(box(18, 0.2, 10, mat(0x12100d, { rough: 0.8 }), 0, -0.1, 0));
  const grid = new THREE.GridHelper(16, 16, 0x2a2621, 0x1d1a16);
  grid.position.set(0, 0.005, -0.5);
  g.add(grid);
  const X = (m) => -7.5 + (m / 12) * 15;
  const Y = (pct) => 4.5 + pct * 0.085;
  // Illustrative paths: the unprotected portfolio falls 40%; the
  // diversified one falls 59% less (to 16.4%).
  const shape = (m) => {
    if (m < 2) return -m * 1.5;
    if (m < 5) return -3 - ((m - 2) / 3) * 37;
    if (m < 7) return -40 + Math.sin(((m - 5) / 2) * Math.PI) * 2;
    return -40 + ((m - 7) / 5) * 22;
  };
  const N = 96;
  const unp = [];
  const div = [];
  for (let i = 0; i <= N; i += 1) {
    const m = (i / N) * 12;
    const s = shape(m);
    unp.push(V(X(m), Y(s), 0));
    div.push(V(X(m), Y(s * 0.41), 0.5));
  }
  const unpT = tube(unp, 0.06, mat(C.crimson, { emissive: C.crimson, ei: 0.8 }));
  const divT = tube(div, 0.07, mat(C.amber, { emissive: C.amber, ei: 0.9 }));
  g.add(unpT, divT);
  // Fill the gap between the two lines.
  const pos = [];
  for (let i = 0; i < N; i += 1) {
    const a = unp[i];
    const b = unp[i + 1];
    const c = div[i];
    const d = div[i + 1];
    pos.push(a.x, a.y, 0.25, c.x, c.y, 0.25, b.x, b.y, 0.25, b.x, b.y, 0.25, c.x, c.y, 0.25, d.x, d.y, 0.25);
  }
  const fg = new THREE.BufferGeometry();
  fg.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  const fill = new THREE.Mesh(fg, new THREE.MeshBasicMaterial({ color: C.amber, transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false }));
  g.add(fill);
  g.add(box(15.4, 0.02, 0.02, mat(0x5a544a), 0, Y(0), 0.25));
  g.add(label("unprotected", V(X(6), Y(-40) - 0.6, 0), "small bad"));
  g.add(label("with ARAIA: −59% drawdown (simulated)", V(X(6.4), Y(-16.4) + 0.8, 0.5), "accent"));
  g.add(label("illustrative stress year", V(X(10.5), Y(0) + 0.6, 0), "small dim"));
  const uc = unpT.geometry.index.count;
  const dc = divT.geometry.index.count;

  return {
    id: "market",
    group: g,
    view: { center: V(0, 2.4, 0.6), dist: 23, dir: V(0.28, 0.4, 1) },
    slot: { pos: V(-6.4, 0.006, 3.4), scale: 0.05 },
    update(dt, t) {
      const k = clamp((t % 7) / 4, 0, 1);
      unpT.geometry.setDrawRange(0, Math.floor(uc * k / 6) * 6);
      divT.geometry.setDrawRange(0, Math.floor(dc * k / 6) * 6);
      fg.setDrawRange(0, Math.floor(N * k) * 6);
    },
  };
}

/* -------------------------------------------------------- 13 · 4 years */
export function timeline() {
  const g = new THREE.Group();
  const X = (year) => -14 + (year - 2023) * 7;
  g.add(tube([V(X(2023), 0, 0), V(X(2027), 0, 0)], 0.07, mat(C.amber, { emissive: C.amber, ei: 0.7 })));
  const future = tube([V(X(2027), 0, 0), V(X(2027) + 4, 0, 0)], 0.05, glow(C.amber, 0.25));
  g.add(future);
  for (let y = 2023; y <= 2027; y += 1) {
    g.add(box(0.06, 0.7, 0.06, mat(0x8f887c), X(y), 0, 0));
    g.add(label(String(y), V(X(y), -0.8, 0), "year"));
  }
  const marks = [
    [2023.6, "B.Tech CSE (AI) begins"],
    [2024.55, "LetsGrowMore · Python Developer"],
    [2026.83, "now"],
    [2027.4, "graduation"],
  ];
  marks.forEach(([y, text], i) => {
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.22, 20, 14), glow(i === 2 ? C.green : C.amber));
    s.position.set(X(y), 0, 0);
    g.add(s);
    g.add(label(text, V(X(y), 1.0 + (i % 2) * 0.6, 0), i === 2 ? "small good" : "small"));
  });
  // Twelve dots: one for every stop you passed, lit in order.
  const dots = Array.from({ length: 12 }, (_, i) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 10), glow(C.amber, 0.15));
    const a = (i / 11) * Math.PI;
    m.position.set(X(2023.3) + (i / 11) * (X(2026.6) - X(2023.3)), 2.6 + Math.sin(a) * 1.1, -1.5);
    g.add(m);
    return m;
  });
  g.add(label("every stop you passed", V(X(2025), 4.3, -1.5), "small dim"));
  const pulse = new THREE.Mesh(new THREE.SphereGeometry(0.35, 20, 14), glow(C.amber, 0.6));
  g.add(pulse);
  g.add(label("2027 → your team?", V(X(2027) + 2.6, 0.8, 0), "accent"));

  return {
    id: "timeline",
    group: g,
    view: { center: V(1, 1.2, 0), dist: 31, dir: V(0.08, 0.45, 1) },
    slot: { pos: V(X(2025.4), 0.25, 2.2), scale: 0.05 },
    update(dt, t) {
      const k = t % 6;
      dots.forEach((d, i) => (d.material.opacity = k > i * 0.25 ? 1 : 0.15));
      const p = (t % 2.5) / 2.5;
      pulse.position.set(X(2027) + p * 4, 0, 0);
      pulse.material.opacity = 0.7 * (1 - p);
    },
  };
}

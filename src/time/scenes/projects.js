import * as THREE from "three";
import { V, rng, mat, glow, box, tube, label, canvasTex, screen, C, clamp } from "../common.js";
import { TASKS, flow, schedule, actions } from "../../live/taskflow.js";

/* The project scenes added for the six featured projects:
 * TaskFlow Pro (under 1 ms), Rank Radar (one ball), FairFix (10 minutes at
 * the counter) and the AI Exam Generator (a 3-hour exam). */

/* --------------------------------------------- TaskFlow Pro · under 1 ms */
export function gantt() {
  const g = new THREE.Group();
  g.add(box(18, 0.2, 10.6, mat(0x12100d, { metal: 0.2, rough: 0.7 }), 0, -0.1, 0));
  const X = (day) => -4.6 + day * 0.7;
  const Z = (i) => -3.6 + i * 1.12;
  for (let d = 0; d <= 18; d += 1) {
    g.add(box(0.015, 0.01, 7.9, mat(d % 5 === 0 ? 0x3a352e : 0x221f1b), X(d), 0.005, -0.25));
    if (d % 5 === 0) g.add(label(`day ${d}`, V(X(d), 0.2, -4.6), "small dim"));
  }
  const rows = TASKS.map((t, i) => {
    const geo = new THREE.BoxGeometry(1, 0.3, 0.62);
    geo.translate(0.5, 0, 0);
    const m = new THREE.Mesh(geo, mat(0x8f887c, { emissive: 0x8f887c, ei: 0.2, rough: 0.4 }));
    m.position.set(X(0), 0.15, Z(i));
    g.add(m);
    const tag = label(t.name, V(X(0) - 0.4, 0.3, Z(i)), "small left");
    g.add(tag);
    return { t, m, tag, x: X(0), w: 1 };
  });
  // Dependency links: thin elbows that follow the bars.
  const linkMat = glow(0x948c80, 0.75);
  const links = [];
  TASKS.forEach((t, i) => t.deps.forEach((d) => {
    const j = TASKS.findIndex((x) => x.id === d);
    const mesh = new THREE.Mesh(new THREE.BufferGeometry(), linkMat);
    g.add(mesh);
    links.push({ from: j, to: i, mesh });
  }));
  const loopMat = glow(C.crimson, 0.9);
  const loop = new THREE.Mesh(new THREE.BufferGeometry(), loopMat);
  g.add(loop);
  const note = label("", V(2, 1.4, 4.4), "accent");
  g.add(note);

  let auto = 0;
  let lastPh = 0;
  function elbow(a, b) {
    const p = [V(a.x + a.w, 0.32, a.z), V(a.x + a.w + 0.25, 0.32, a.z), V(a.x + a.w + 0.25, 0.32, b.z), V(b.x, 0.32, b.z)];
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(p, false, "catmullrom", 0), 24, 0.03, 5, false);
  }

  return {
    id: "gantt",
    group: g,
    view: { center: V(0.6, 0, 0.2), dist: 19, dir: V(0, 1, 0.78) },
    slot: { pos: V(7.4, 0.016, 4.3), scale: 0.05 },
    update(dt, t, ctx) {
      // Demo loop until a visitor uses the widget: slip, hold, recover, try a loop.
      if (ctx.framed && performance.now() - flow.touched > 12000) {
        auto += dt;
        const k = auto % 9;
        const ph = k < 1 ? 0 : k < 4.5 ? 1 : k < 6.5 ? 2 : 3;
        if (ph !== lastPh) {
          lastPh = ph;
          if (ph === 1 && !flow.delay) actions.toggleDelay();
          if (ph === 2 && flow.delay) actions.toggleDelay();
          if (ph === 3) actions.tryCycle();
          if (ph === 0) flow.rejected = null;
          flow.touched = performance.now() - 13000;
        }
      }
      const { out, crit } = schedule();
      rows.forEach((r, i) => {
        const s = out[r.t.id];
        const tx = X(s.start);
        const tw = s.dur * 0.7 - 0.08;
        r.x += (tx - r.x) * (1 - Math.exp(-6 * dt));
        r.w += (tw - r.w) * (1 - Math.exp(-6 * dt));
        r.m.position.x = r.x;
        r.m.scale.x = r.w;
        const moved = flow.moved[r.t.id];
        const col = moved && flow.delay ? C.amber : crit.has(r.t.id) ? C.cyan : 0x8f887c;
        r.m.material.color.set(col);
        r.m.material.emissive.set(col);
        r.z = Z(i);
      });
      for (const l of links) {
        l.mesh.geometry.dispose();
        l.mesh.geometry = elbow(rows[l.from], rows[l.to]);
      }
      if (flow.rejected) {
        const a = rows[6];
        const b = rows[0];
        const p = [V(a.x + a.w, 0.4, a.z), V(a.x + a.w + 0.8, 0.4, a.z), V(a.x + a.w + 0.8, 0.4, b.z - 0.6), V(b.x - 0.3, 0.4, b.z - 0.6), V(b.x - 0.3, 0.4, b.z)];
        loop.geometry.dispose();
        loop.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(p, false, "catmullrom", 0), 32, 0.045, 5, false);
        loop.visible = Math.sin(t * 12) > -0.3;
      } else loop.visible = false;
      const txt = flow.rejected ? "cycle rejected · nothing saved" : flow.delay ? "+3 days propagated · max, not sum" : "critical path";
      if (note.element.textContent !== txt) {
        note.element.textContent = txt;
        note.element.classList.toggle("bad", !!flow.rejected);
      }
    },
  };
}

/* ------------------------------------------------ Rank Radar · one ball */
export function match() {
  const g = new THREE.Group();
  const field = new THREE.Mesh(new THREE.CylinderGeometry(9.4, 9.4, 0.12, 96), mat(0x1f4a2a, { rough: 0.9 }));
  field.scale.z = 0.82;
  field.position.y = -0.06;
  g.add(field);
  // Mowing stripes.
  for (let i = -4; i <= 4; i += 1) g.add(box(1.0, 0.004, 14.6, mat(i % 2 ? 0x24552f : 0x1c4426, { rough: 0.9 }), i * 2, 0.002, 0));
  const rope = new THREE.Mesh(new THREE.TorusGeometry(8.9, 0.05, 6, 120), mat(0xf2eee6, { emissive: 0xf2eee6, ei: 0.3 }));
  rope.rotation.x = Math.PI / 2;
  rope.scale.y = 0.82;
  rope.position.y = 0.06;
  g.add(rope);
  g.add(box(1.3, 0.03, 6.4, mat(0xb8a27a, { rough: 0.95 }), 0, 0.015, 0));
  for (const z of [-3, 3]) {
    for (const dx of [-0.13, 0, 0.13]) {
      const st = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.72, 8), mat(0xf2eee6));
      st.position.set(dx, 0.36, z);
      g.add(st);
    }
  }
  // Floodlights.
  for (const [x, z] of [[-9.5, -6.5], [9.5, -6.5]]) {
    g.add(box(0.25, 6, 0.25, mat(0x3a352e, { metal: 0.7 }), x, 3, z));
    const head = box(1.4, 0.7, 0.3, glow(0xfff4d6), x, 6.1, z);
    head.lookAt(0, 0, 0);
    g.add(head);
  }
  // Ball.
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 12), mat(0xc0281e, { emissive: 0x6a0f0a, ei: 0.6 }));
  g.add(ball);
  const trail = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 8), glow(C.amber, 0.25));
  g.add(trail);
  // Scoreboard.
  const rand = rng(62);
  let rank = 4812;
  let lastBall = -1;
  let event = "";
  const boardTex = canvasTex(1024, 520, (c, w, h, ballNo = 0, ev = "", r = 4812, dr = 0) => {
    c.fillStyle = "#0d0b09";
    c.fillRect(0, 0, w, h);
    c.strokeStyle = "#3a352e";
    c.lineWidth = 6;
    c.strokeRect(3, 3, w - 6, h - 6);
    c.fillStyle = "#948c80";
    c.font = "600 36px JetBrains Mono, monospace";
    const over = `${14 + Math.floor(ballNo / 6)}.${(ballNo % 6) + 1}`;
    c.fillText(`OVER ${over}`, 44, 76);
    c.fillStyle = ev === "WICKET" ? "#ff5a36" : ev ? "#ffb000" : "#c9c2b6";
    c.font = "800 76px Archivo, sans-serif";
    c.fillText(ev || "dot ball", 44, 176);
    c.fillStyle = "#948c80";
    c.font = "600 34px JetBrains Mono, monospace";
    c.fillText("YOUR RANK", 44, 270);
    c.fillStyle = "#f2eee6";
    c.font = "800 120px Archivo, sans-serif";
    c.fillText(r.toLocaleString("en-IN"), 44, 390);
    if (dr) {
      c.fillStyle = dr < 0 ? "#7be38a" : "#ff5a36";
      c.font = "700 50px JetBrains Mono, monospace";
      c.fillText(`${dr < 0 ? "▲" : "▼"} ${Math.abs(dr).toLocaleString("en-IN")}`, 560, 388);
    }
    c.fillStyle = "#5a544a";
    c.font = "500 26px JetBrains Mono, monospace";
    c.fillText("simulated match · 2,500 rival teams", 44, 470);
  });
  const board = screen(7.2, 3.66, boardTex, 1.1);
  board.position.set(0, 2.9, -7.5);
  g.add(board);
  g.add(box(7.6, 4.1, 0.2, mat(0x1b1916, { metal: 0.5 }), 0, 2.9, -7.75));
  g.add(box(0.3, 1.0, 0.3, mat(0x1b1916, { metal: 0.5 }), 0, 0.5, -7.75));

  return {
    id: "match",
    group: g,
    view: { center: V(0, 1.2, -1.6), dist: 21, dir: V(0.25, 0.5, 1) },
    slot: { pos: V(0.75, 0.17, 3.35), scale: 0.03 },
    update(dt, t) {
      const n = Math.floor(t / 2.6);
      const k = (t % 2.6) / 2.6;
      if (n !== lastBall) {
        lastBall = n;
        const r = rand();
        event = r < 0.12 ? "WICKET" : r < 0.3 ? "FOUR" : r < 0.38 ? "SIX" : r < 0.62 ? "1 run" : "";
        const dr = Math.round((event === "WICKET" ? -1 : event === "SIX" || event === "FOUR" ? (rand() < 0.5 ? -1 : 1) : rand() < 0.5 ? -0.2 : 0.2) * (400 + rand() * 1600));
        rank = clamp(rank + dr, 120, 25000);
        boardTex.redraw(n % 36, event, rank, dr);
      }
      // Bowl down the pitch, then the shot.
      if (k < 0.45) {
        const a = k / 0.45;
        ball.position.set(0.05, 0.25 + Math.sin(a * Math.PI) * 0.6 * (1 - a) + (a > 0.75 ? 0.1 : 0), -2.8 + a * 5.7);
      } else {
        const a = (k - 0.45) / 0.55;
        const far = event === "SIX" || event === "FOUR" ? 8.4 : event === "1 run" ? 4 : event === "WICKET" ? 0.4 : 1.6;
        const ang = (lastBall * 1.7) % (Math.PI * 2);
        const h = event === "SIX" ? 3.2 : 0.4;
        ball.position.set(Math.sin(ang) * far * a, 0.15 + Math.sin(a * Math.PI) * h, 2.9 - Math.cos(ang) * far * a * 0.82);
      }
      trail.position.lerp(ball.position, 0.3);
    },
  };
}

/* ---------------------------------------------- FairFix · 10 minutes */
const LINES = [
  ["Engine oil 5W-30", "1,240", "supported"],
  ["Oil filter", "380", "supported"],
  ["Coolant flush", "1,450", "confirm"],
  ["Brake pads (front)", "3,900", "verify"],
  ["Wheel alignment", "800", "na"],
  ["Air filter", "690", "confirm"],
];
const VERDICT = {
  supported: ["Supported by evidence", "#7be38a"],
  confirm: ["Needs confirmation", "#ffb000"],
  verify: ["Unable to verify", "#948c80"],
  na: ["Not applicable", "#5a544a"],
};

export function bill() {
  const g = new THREE.Group();
  g.add(box(18, 0.4, 10, mat(0x2a221a, { rough: 0.7 }), 0, -0.2, 0));
  const billTex = canvasTex(640, 900, (c, w, h, scan = 0) => {
    c.fillStyle = "#f2eee6";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#0a0908";
    c.font = "800 40px Archivo, sans-serif";
    c.fillText("SERVICE INVOICE", 40, 70);
    c.font = "500 20px JetBrains Mono, monospace";
    c.fillStyle = "#5a544a";
    c.fillText("sample bill · 2 visits · 30,000 km", 40, 104);
    c.fillRect(40, 124, w - 80, 2);
    LINES.forEach(([item, price, v], i) => {
      const y = 180 + i * 104;
      c.fillStyle = "#0a0908";
      c.font = "600 28px JetBrains Mono, monospace";
      c.fillText(item, 40, y);
      c.textAlign = "right";
      c.fillText(`₹${price}`, w - 40, y);
      c.textAlign = "left";
      if (scan > (i + 1) / (LINES.length + 1)) {
        const [txt, col] = VERDICT[v];
        c.fillStyle = col;
        c.fillRect(40, y + 16, 14, 30);
        c.fillStyle = v === "verify" || v === "na" ? "#5a544a" : "#0a0908";
        c.font = "600 22px JetBrains Mono, monospace";
        c.fillText(txt, 66, y + 40);
      }
    });
    c.fillStyle = "#0a0908";
    c.fillRect(40, h - 110, w - 80, 2);
    c.font = "800 34px Archivo, sans-serif";
    c.fillText("Total", 40, h - 56);
    c.textAlign = "right";
    c.fillText("₹8,460", w - 40, h - 56);
    c.textAlign = "left";
  });
  const paper = screen(6, 8.4, billTex, 1);
  paper.rotation.x = -Math.PI / 2;
  paper.position.set(-1.6, 0.012, 0);
  g.add(paper);
  const beam = box(6.4, 0.06, 0.08, glow(C.cyan, 0.9), -1.6, 0.06, -4.2);
  g.add(beam);
  const beamGlow = box(6.4, 0.02, 0.6, glow(C.cyan, 0.18), -1.6, 0.03, -4.2);
  g.add(beamGlow);
  // The drafted question.
  const qTex = canvasTex(760, 300, (c, w, h) => {
    c.fillStyle = "#12100d";
    c.fillRect(0, 0, w, h);
    c.strokeStyle = "#ffb000";
    c.lineWidth = 5;
    c.strokeRect(3, 3, w - 6, h - 6);
    c.fillStyle = "#948c80";
    c.font = "600 26px JetBrains Mono, monospace";
    c.fillText("DRAFT QUESTION FOR THE ADVISOR", 30, 54);
    c.fillStyle = "#f2eee6";
    c.font = "500 32px Archivo, sans-serif";
    ["Could you show me where the coolant", "flush is due on the service schedule?", "Happy to go ahead once I've seen it."].forEach((l, i) => c.fillText(l, 30, 120 + i * 50));
  });
  const q = screen(5.2, 2.05, qTex, 1);
  q.position.set(4.8, 1.7, -1.8);
  q.rotation.set(-0.5, -0.25, 0);
  g.add(q);
  // Car key and phone.
  g.add(box(0.5, 0.12, 1.0, mat(0x111214, { metal: 0.4, rough: 0.4 }), 3.6, 0.06, 2.6));
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.04, 8, 24), mat(0x8f887c, { metal: 0.9, rough: 0.3 }));
  ring.rotation.x = Math.PI / 2;
  ring.position.set(3.6, 0.06, 3.05);
  g.add(ring);
  const phone = new THREE.Group();
  phone.add(box(1.1, 0.08, 2.1, mat(0x111214, { metal: 0.5, rough: 0.3 }), 0, 0, 0));
  const phScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 1.9), glow(C.cyan, 0.35));
  phScreen.rotation.x = -Math.PI / 2;
  phScreen.position.y = 0.06;
  phone.add(phScreen);
  phone.position.set(2.2, 3.4, 0);
  phone.rotation.x = 0.2;
  g.add(phone);
  g.add(label("models read · code decides", V(4.8, 3.2, -1.8), "accent"));

  return {
    id: "bill",
    group: g,
    view: { center: V(0.8, 0.4, 0.2), dist: 19, dir: V(0.12, 1, 0.68) },
    slot: { pos: V(5.6, 0.006, 3), scale: 0.045 },
    update(dt, t) {
      const k = (t % 7) / 5.5;
      const scan = clamp(k, 0, 1);
      beam.position.z = beamGlow.position.z = -4.2 + scan * 8.4;
      beam.visible = beamGlow.visible = k < 1;
      billTex.redraw(scan);
      phone.position.z = -3 + scan * 5;
      q.visible = k > 1;
    },
  };
}

/* ------------------------------------- AI Exam Generator · 3 hours */
export function exam() {
  const g = new THREE.Group();
  g.add(box(16, 0.3, 10, mat(0x241e18, { rough: 0.7 }), 0, -0.15, 0));
  const paperTex = canvasTex(640, 860, (c, w, h, scan = 0, graded = false) => {
    c.fillStyle = "#f2eee6";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#0a0908";
    c.font = "800 36px Archivo, sans-serif";
    c.fillText("Chapter 4 · Exam", 40, 64);
    c.fillStyle = "#5a544a";
    c.font = "500 20px JetBrains Mono, monospace";
    c.fillText("generated from the uploaded chapter", 40, 96);
    const qs = [
      ["MCQ", "Q1. Which structure gives O(1) average lookup?"],
      ["MCQ", "Q2. What does idempotent mean for an API?"],
      ["SHORT", "Q6. Explain what a dead-letter queue is for."],
      ["CODING", "Q9. Write a function to detect a cycle."],
    ];
    qs.forEach(([kind, text], i) => {
      const y = 160 + i * 168;
      c.fillStyle = "#948c80";
      c.font = "600 18px JetBrains Mono, monospace";
      c.fillText(kind, 40, y);
      c.fillStyle = "#0a0908";
      c.font = "600 22px Archivo, sans-serif";
      c.fillText(text, 40, y + 32);
      // Handwritten answer squiggle.
      c.strokeStyle = "#2c4a8a";
      c.lineWidth = 3;
      c.beginPath();
      for (let x = 0; x < 420; x += 6) c.lineTo(52 + x, y + 80 + Math.sin(x * 0.18 + i) * 7 + (x % 60 < 6 ? -4 : 0));
      c.stroke();
      if (graded) {
        c.fillStyle = i === 2 ? "#b36b00" : "#2f8a3e";
        c.font = "800 44px Archivo, sans-serif";
        c.fillText(i === 2 ? "~" : "✓", w - 90, y + 60);
      }
    });
    if (scan > 0 && scan < 1) {
      c.fillStyle = "rgba(95,212,245,0.35)";
      c.fillRect(0, scan * h - 10, w, 20);
    }
    if (graded) {
      c.strokeStyle = "#c0281e";
      c.lineWidth = 6;
      c.beginPath();
      c.arc(w - 110, 70, 50, 0, Math.PI * 2);
      c.stroke();
      c.fillStyle = "#c0281e";
      c.font = "800 56px Archivo, sans-serif";
      c.textAlign = "center";
      c.fillText("A", w - 110, 90);
      c.textAlign = "left";
    }
  });
  const paper = screen(5.6, 7.5, paperTex, 1);
  paper.rotation.x = -Math.PI / 2;
  paper.rotation.z = 0.04;
  paper.position.set(-1.4, 0.012, 0.2);
  g.add(paper);
  // Pencil.
  const pencil = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 3.2, 6), mat(0xffb000, { rough: 0.5 }));
  pencil.rotation.set(Math.PI / 2, 0, 0.6);
  pencil.position.set(2.6, 0.08, 1.6);
  g.add(pencil);
  // Scanner frame hovering over the page.
  const frame = new THREE.Group();
  for (const [x, z, rx] of [[-2.9, -3.8, 0], [2.9, -3.8, 1], [-2.9, 3.8, 3], [2.9, 3.8, 2]]) {
    const corner = new THREE.Group();
    corner.add(box(0.9, 0.04, 0.1, glow(C.cyan), 0.4, 0, 0));
    corner.add(box(0.1, 0.04, 0.9, glow(C.cyan), 0, 0, 0.4));
    corner.rotation.y = -rx * (Math.PI / 2);
    corner.position.set(x, 0, z);
    frame.add(corner);
  }
  frame.position.set(-1.4, 1.2, 0.2);
  g.add(frame);
  const stage = label("OCR → evaluate → grade", V(-1.4, 0.6, 4.6), "accent");
  g.add(stage);
  const sections = label("MCQ · short answer · coding", V(3.8, 0.6, -2.6), "small");
  g.add(sections);

  return {
    id: "exam",
    group: g,
    view: { center: V(0.4, 0.4, 0.2), dist: 18.5, dir: V(0.12, 1, 0.66) },
    slot: { pos: V(4.6, 0.02, -2.0), scale: 0.06 },
    update(dt, t) {
      const k = (t % 7) / 7;
      const scan = clamp((k - 0.15) / 0.45, 0, 1);
      const graded = k > 0.65;
      paperTex.redraw(scan, graded);
      frame.visible = k > 0.08 && k < 0.65;
      frame.position.y = 1.2 + Math.sin(t * 2) * 0.08;
      const txt = k < 0.15 ? "chapter → questions" : graded ? "graded · feedback per question" : "OCR reading handwriting…";
      if (stage.element.textContent !== txt) stage.element.textContent = txt;
    },
  };
}

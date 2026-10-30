import * as THREE from "three";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { V, clamp, smooth } from "./common.js";

/* Powers of time.
 *
 * Scenes are ordered from the shortest timescale (1 ns) to the longest
 * (4 years). Each scene holds the one before it at a `slot` (position and
 * scale in its own coordinates): the cache hit sits inside the RAM read,
 * the RAM read inside the Redis GET, and so on.
 *
 * One number, z, says where we are: z = i frames scene i. Between i and i+1
 * the camera works in scene i+1's coordinates and flies out from the child
 * to the whole scene, with distance interpolated in log space so every 10x
 * step takes the same time. Only four scenes are drawn at once
 * (grandchild, child, base, parent), all relative to the base, so nothing
 * needs huge coordinates. */

const damp = (a, b, l, dt) => a + (b - a) * (1 - Math.exp(-l * dt));
const logLerp = (a, b, k) => Math.exp(Math.log(a) + (Math.log(b) - Math.log(a)) * k);
const Z = V(0, 0, 1);

export function createEngine({ canvas, labelRoot, scenes, onFrame }) {
  const N = scenes.length;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.setClearColor(0x0a0908, 1);

  const labels = new CSS2DRenderer({ element: labelRoot });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.01, 1000);

  // The light rig rides with the camera, so every timescale is lit alike.
  const hemi = new THREE.HemisphereLight(0xe8ecff, 0x1a1410, 0.75);
  const key = new THREE.DirectionalLight(0xfff0dc, 2.0);
  const rim = new THREE.DirectionalLight(0x5fd4f5, 0.9);
  scene.add(hemi, key, key.target, rim, rim.target);

  const holders = scenes.map((S) => {
    const h = new THREE.Group();
    h.add(S.group);
    h.visible = false;
    scene.add(h);
    return h;
  });
  const tags = scenes.map((S) => {
    const list = [];
    S.group.traverse((o) => o.isCSS2DObject && list.push(o));
    return list;
  });
  const clocks = scenes.map(() => 0);

  const st = { z: 0, target: 0, time: 0, yaw: 0, pitch: 0, yawT: 0, pitchT: 0, drag: null, vel: 0 };

  let fit = 1;
  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    labels.setSize(w, h);
    camera.aspect = w / h;
    // Keep the subject clear of the text: right of the panel on desktop,
    // above the bottom sheet on a phone held upright.
    const sideways = h < 560 && w < 1200;
    const narrow = w < 820 || sideways;
    camera.fov = narrow && !sideways ? 56 : 38;
    const ox = !narrow || sideways ? -w * (sideways ? 0.24 : 0.17) : 0;
    const oy = narrow && !sideways ? h * 0.2 : 0;
    camera.setViewOffset(w, h, ox, oy, w, h);
    fit = w / h < 1 ? Math.min(1.9, 0.8 / (w / h)) : 1;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);

  const rest = (S) => ({ c: S.view.center.clone(), d: S.view.dist, dir: S.view.dir.clone().normalize() });

  function place(i, pos, scale) {
    const h = holders[i];
    h.visible = true;
    h.position.copy(pos);
    h.scale.setScalar(scale);
  }

  const q1 = new THREE.Quaternion();
  const q2 = new THREE.Quaternion();
  const tmp = V();

  function frame(dt) {
    st.time += dt;
    const zPrev = st.z;
    st.z = damp(st.z, st.target, 2.1, dt);
    if (Math.abs(st.z - st.target) < 1e-4) st.z = st.target;
    st.vel = dt > 0 ? (st.z - zPrev) / dt : 0;
    st.yaw = damp(st.yaw, st.yawT, 4, dt);
    st.pitch = damp(st.pitch, st.pitchT, 4, dt);
    if (!st.drag) {
      st.yawT = damp(st.yawT, 0, 0.5, dt);
      st.pitchT = damp(st.pitchT, 0, 0.5, dt);
    }

    const z = clamp(st.z, 0, N - 1);
    const B = z >= N - 1 ? N - 1 : Math.floor(z) + 1;
    const f = z >= N - 1 ? 1 : z - Math.floor(z);
    const base = scenes[B];
    const child = scenes[B - 1];

    holders.forEach((h) => (h.visible = false));
    place(B, V(), 1);
    if (child) {
      place(B - 1, base.slot.pos, base.slot.scale);
      const g = scenes[B - 2];
      if (g) place(B - 2, base.slot.pos.clone().addScaledVector(child.slot.pos, base.slot.scale), base.slot.scale * child.slot.scale);
    }
    const parent = scenes[B + 1];
    if (parent) {
      const s = 1 / parent.slot.scale;
      place(B + 1, parent.slot.pos.clone().multiplyScalar(-s), s);
    }

    // Fly from framing the child to framing the base.
    let center;
    let dist;
    let dir;
    const rB = rest(base);
    if (child && f < 1) {
      const rC = rest(child);
      const cA = base.slot.pos.clone().addScaledVector(rC.c, base.slot.scale);
      const dA = rC.d * base.slot.scale;
      dist = logLerp(dA, rB.d, f);
      const w = clamp((dist - dA) / (rB.d - dA), 0, 1);
      center = cA.lerp(rB.c, w);
      q1.setFromUnitVectors(Z, rC.dir);
      q2.setFromUnitVectors(Z, rB.dir);
      dir = Z.clone().applyQuaternion(q1.slerp(q2, smooth(f)));
    } else {
      center = rB.c.clone();
      dist = rB.d;
      dir = rB.dir.clone();
    }

    dir.applyEuler(new THREE.Euler(st.pitch, st.yaw, 0, "YXZ"));
    dist *= fit;
    camera.position.copy(center).addScaledVector(dir, dist);
    camera.up.set(0, 1, 0);
    if (Math.abs(dir.y) > 0.985) camera.up.set(0, 0, -1);
    camera.lookAt(center);
    camera.near = dist * 0.01;
    camera.far = dist * 200;
    camera.updateProjectionMatrix();

    key.position.copy(camera.position).add(tmp.set(dist * 0.6, dist * 1.2, dist * 0.4));
    key.target.position.copy(center);
    rim.position.copy(center).add(tmp.set(-dist, dist * 0.3, -dist));
    rim.target.position.copy(center);

    // Time dilation: a scene runs at real speed when framed, faster as it
    // shrinks into the next one, slower while it's still the big parent.
    for (let i = 0; i < N; i += 1) {
      const framed = Math.abs(z - i) < 0.25;
      tags[i].forEach((o) => {
        const on = holders[i].visible && framed;
        if (o.userData.on !== on) {
          o.userData.on = on;
          o.visible = on;
          o.element.style.display = on ? "" : "none";
        }
      });
      if (!holders[i].visible) continue;
      const speed = clamp(10 ** (z - i), 0.05, 40);
      clocks[i] += dt * speed;
      scenes[i].update?.(dt * speed, clocks[i], { z, i, framed, speed });
    }

    onFrame?.(z, st);
    renderer.render(scene, camera);
    labels.render(scene, camera);
  }

  // Warm-up: compile every shader and upload every texture before the first
  // input, so no later frame does first-time GPU work.
  holders.forEach((h) => (h.visible = true));
  const culled = [];
  scene.traverse((o) => {
    if (o.isMesh || o.isLine || o.isPoints) {
      culled.push([o, o.frustumCulled]);
      o.frustumCulled = false;
    }
  });
  renderer.compile(scene, camera);
  renderer.render(scene, camera);
  culled.forEach(([o, fc]) => (o.frustumCulled = fc));
  holders.forEach((h) => (h.visible = false));

  let last = performance.now();
  let running = true;
  function loop(now) {
    if (!running) return;
    frame(Math.min(0.05, (now - last) / 1000));
    last = now;
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  canvas.addEventListener("pointerdown", (e) => {
    st.drag = { x: e.clientX, y: e.clientY, yaw: st.yawT, pitch: st.pitchT };
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!st.drag) return;
    st.yawT = clamp(st.drag.yaw - (e.clientX - st.drag.x) * 0.004, -0.9, 0.9);
    st.pitchT = clamp(st.drag.pitch - (e.clientY - st.drag.y) * 0.003, -0.5, 0.5);
  });
  const end = () => (st.drag = null);
  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointercancel", end);

  return {
    go(i) {
      st.target = clamp(i, 0, N - 1);
    },
    /** Jump without flying (used by reduced motion). */
    jump(i) {
      st.target = st.z = clamp(i, 0, N - 1);
    },
    get z() {
      return st.z;
    },
    get target() {
      return st.target;
    },
    pause(p) {
      running = !p;
      if (running) {
        last = performance.now();
        requestAnimationFrame(loop);
      }
    },
    setAccent(color) {
      rim.color.copy(color);
    },
  };
}

import "./style.css";
import { person, tour, edges } from "./content.js";
import { createMorph } from "./ui/morph.js";
import { createHud, logAt, timeParts, sci } from "./ui/hud.js";
import { bindInput } from "./ui/input.js";
import { createSound } from "./ui/sound.js";
import { flow, schedule, actions as tf, TASKS, nameOf } from "./live/taskflow.js";
import { searchIncidents } from "./live/rca.js";
import { current as stats, ready as statsReady } from "./live/stats.js";

/* The page around the zoom: the text panel, the HUD, input, live demos and
 * the overlays. Without WebGL, every stop is shown as a normal page. */

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const ext = (href, label, cls = "") => `<a class="${cls}" href="${esc(href)}" target="_blank" rel="noopener">${label}</a>`;
const pad = (n) => String(n).padStart(2, "0");
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const SECONDS = tour.map((t) => t.seconds);

/* ---- panel HTML ------------------------------------------------------ */
function panelHTML(t, i) {
  let h = `<p class="kicker"><span>${pad(i + 1)}</span>${esc(t.kicker)}</p>`;
  h += t.hero ? `<h1>${esc(t.title)}</h1>` : `<h2>${esc(t.title)}</h2>`;
  if (t.badge) h += `<p class="badge">${esc(t.badge)}</p>`;
  if (t.meta) h += `<p class="meta">${esc(t.meta)}</p>`;
  if (t.body) h += t.body.map((p, k) => `<p class="${k === 0 ? "lede" : ""}">${esc(p)}</p>`).join("");
  if (t.hero) {
    h += `<p class="actions">${ext(person.resume, "Resume", "btn")}${ext(person.links.github, "GitHub", "btn ghost")}${ext(person.links.linkedin, "LinkedIn", "btn ghost")}<a class="btn ghost" href="mailto:${person.email}">Email</a></p>`;
  }
  if (t.groups) h += `<dl class="groups">${t.groups.map(([g, v]) => `<dt>${esc(g)}</dt><dd>${esc(v)}</dd>`).join("")}</dl>`;
  if (t.points) h += `<ul class="points">${t.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>`;
  if (t.project) {
    const p = t.project;
    h += `<p class="lede">${esc(p.line)}</p><p class="note">${esc(p.detail)}</p><p class="tech">${p.tech.map(esc).join(" · ")}</p>`;
    h += `<p class="actions">${p.site ? ext(p.site, "Open the live demo", "btn") : ""}${ext(p.repo, "Source on GitHub", "btn ghost")}</p>`;
  }
  if (t.cp) {
    const s = stats.leetcode;
    h += `<div class="peak"><span class="k">LeetCode contest rating</span><b>${s.rating}</b><span>${esc(s.badge)} · ${s.solved} problems solved</span>${ext(person.links.leetcode, "Profile")}</div>`;
  }
  if (t.live === "taskflow") h += `<div class="live-slot" data-nomorph id="tf-slot"></div>`;
  if (t.live === "rca") h += `<div class="live-slot" data-nomorph id="rca-slot"></div>`;
  if (t.contact) {
    h += `<p class="email"><a href="mailto:${person.email}">${person.email}</a></p>`;
    h += `<p class="actions">${ext(person.links.github, "GitHub", "btn ghost")}${ext(person.links.linkedin, "LinkedIn", "btn ghost")}${ext(person.links.leetcode, "LeetCode", "btn ghost")}${ext(person.resume, "Resume", "btn ghost")}</p>`;
    h += `<p class="actions"><a class="btn" href="mailto:${person.email}?subject=Internship%20opportunity">Hire me for an internship</a><button class="btn ghost" type="button" id="again">Send another request ↺</button></p>`;
  }
  return h;
}

/* ---- live widgets ----------------------------------------------------- */
function mountTaskflow(slot) {
  slot.innerHTML = `<div class="widget">
  <div class="w-head"><span>dependency engine</span><span class="good">● same rules as TaskFlow Pro</span></div>
  <ol class="w-tasks" id="tf-list"></ol>
  <div class="w-btns"><button type="button" data-a="toggleDelay">Slip “Gather requirements” 3 days</button><button type="button" data-a="tryCycle" class="b-bad">Link Launch → Gather requirements</button><button type="button" data-a="reset" class="b-quiet">Reset the plan</button></div>
  <p class="w-msg" id="tf-msg" aria-live="polite"></p></div>`;
  slot.querySelectorAll("[data-a]").forEach((b) => b.addEventListener("click", () => {
    tf[b.dataset.a]();
    paint();
  }));
  const list = slot.querySelector("#tf-list");
  const msg = slot.querySelector("#tf-msg");
  let last = "";
  function paint() {
    const { out, crit } = schedule();
    const html = TASKS.map((t) => {
      const s = out[t.id];
      const mv = flow.moved[t.id];
      return `<li class="${crit.has(t.id) ? "crit" : ""}"><span>${esc(t.name)}</span><span>day ${s.start}–${s.end}${mv ? ` <b>${mv > 0 ? "+" : ""}${mv}</b>` : ""}</span></li>`;
    }).join("");
    const key = html + flow.message;
    if (key === last) return;
    last = key;
    list.innerHTML = html;
    msg.textContent = flow.message || "Critical path in blue. Try a slip, then try to create a loop.";
    msg.className = `w-msg ${flow.rejected ? "bad" : ""}`;
  }
  paint();
  const timer = setInterval(() => (slot.isConnected ? paint() : clearInterval(timer)), 300);
}

function mountRca(slot) {
  slot.innerHTML = `<form class="widget" id="rca-form">
  <label for="rca-q" class="w-label">Paste an error line</label>
  <div class="w-row"><input id="rca-q" maxlength="500" value="ERROR timeout acquiring connection from pool" autocomplete="off"/><button type="submit">Find similar</button></div>
  <ol class="w-matches" id="rca-out" aria-live="polite"></ol><p class="w-mode" id="rca-mode"></p></form>`;
  const form = slot.querySelector("#rca-form");
  const out = slot.querySelector("#rca-out");
  const mode = slot.querySelector("#rca-mode");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const q = slot.querySelector("#rca-q").value.trim();
    if (!q) return;
    out.innerHTML = `<li class="dim">searching…</li>`;
    const res = await searchIncidents(q);
    out.innerHTML = res.matches
      .map((m) => `<li><b>${esc(m.id)}</b> ${esc(m.title)} <span class="score">${m.score.toFixed(2)}</span><br><span class="fix">fix: ${esc(m.fix)}</span></li>`)
      .join("");
    mode.textContent = res.source === "live" ? "Answered by the live FAISS service." : "Demo mode: ten example incidents, matched in your browser.";
  });
}

function wire(root) {
  const s = root.querySelector("#tf-slot");
  if (s) mountTaskflow(s);
  const r = root.querySelector("#rca-slot");
  if (r) mountRca(r);
  root.querySelector("#again")?.addEventListener("click", () => window.__go?.(0));
}

/* ---- static fallback -------------------------------------------------- */
function renderStill() {
  document.body.classList.add("still");
  const el = document.getElementById("panels");
  el.innerHTML = tour.map((t, i) => `<article class="panel">${panelHTML(t, i)}</article>`).join("");
  wire(el);
}

function webglOK() {
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}

/* ---- the live site ---------------------------------------------------- */
async function start() {
  const [{ buildScenes }, { createEngine }] = await Promise.all([import("./time/scenes/index.js"), import("./time/engine.js")]);
  await document.fonts.ready;
  document.body.classList.add("live");

  const panelsEl = document.getElementById("panels");
  const panel = document.createElement("article");
  panel.className = "panel live";
  panelsEl.innerHTML = "";
  panelsEl.appendChild(panel);
  const morph = createMorph(panel, { reduced });
  const announce = document.getElementById("announce");
  function show(i) {
    panel.classList.toggle("hero", !!tour[i].hero);
    morph(panelHTML(tour[i], i));
    wire(panel);
    announce.textContent = `Stop ${i + 1} of ${tour.length}: ${tour[i].kicker}. ${tour[i].title}.`;
  }
  show(0);
  await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 30)));

  const scenes = buildScenes({ stats });
  statsReady.then(() => scenes.find((s) => s.id === "contest")?.refresh?.());

  const hudSet = createHud(document.body);
  const speedEl = document.getElementById("speed");
  const vignette = document.getElementById("vignette");
  const world = document.getElementById("world");
  const timeOn = document.getElementById("time-on");
  const sound = createSound();
  const cyan = [0x5f, 0xd4, 0xf5];
  const amber = [0xff, 0xb0, 0x00];
  const sunset = [0xff, 0x7a, 0x59];
  const mix = (a, b, k) => a.map((v, i) => Math.round(v + (b[i] - v) * k));
  let lastTitle = "";

  const engine = createEngine({
    canvas: world,
    labelRoot: document.getElementById("labels"),
    scenes,
    onFrame(z, st) {
      const sec = logAt(SECONDS, z);
      const p = hudSet(sec);
      const title = `${p.num} ${p.unit} · ${person.name}`;
      if (title !== lastTitle) {
        lastTitle = title;
        document.title = title;
      }
      // Colour temperature of time: cyan → amber → sunset.
      const u = z / (tour.length - 1);
      const rgb = u < 0.22 ? cyan : u < 0.38 ? mix(cyan, amber, (u - 0.22) / 0.16) : u < 0.66 ? amber : u < 0.82 ? mix(amber, sunset, (u - 0.66) / 0.16) : sunset;
      const css = `rgb(${rgb.join(",")})`;
      document.documentElement.style.setProperty("--accent", css);
      engine?.setAccent({ r: rgb[0] / 255, g: rgb[1] / 255, b: rgb[2] / 255 });
      // Speed lines while flying.
      if (!reduced) speedEl.style.opacity = Math.min(0.5, Math.abs(st.vel) * 0.35).toFixed(3);
    },
  });
  const count = document.getElementById("count");
  const prompt = document.getElementById("prompt");
  const edge = document.getElementById("edge");
  const lids = document.getElementById("lids");
  let edgeTimer = 0;
  let moved = false;
  let keysUsed = false;
  let stop = 0;
  function say(msg) {
    edge.textContent = msg;
    edge.classList.add("on");
    clearTimeout(edgeTimer);
    edgeTimer = setTimeout(() => edge.classList.remove("on"), 4200);
  }
  function goTo(next, via) {
    next = Math.max(0, Math.min(tour.length - 1, next));
    if (next === stop) return;
    stop = next;
    reduced ? engine.jump(next) : engine.go(next);
    show(next);
    sound.stop(next);
    count.textContent = `${pad(next + 1)} / ${pad(tour.length)}`;
    document.querySelectorAll(".dots button").forEach((b, k) => b.classList.toggle("on", k === next));
    if (tour[next].scene === "blink" && !reduced) {
      lids.classList.remove("blink");
      void lids.offsetWidth;
      setTimeout(() => lids.classList.add("blink"), 700);
    }
    if (via === "keys") keysUsed = true;
    if (!moved) {
      moved = true;
      prompt.classList.add(via === "keys" || via === "touch" ? "gone" : "small");
    } else if (keysUsed) prompt.classList.add("gone");
    if (next === tour.length - 1) setTimeout(() => stop === next && say(edges.end), 2600);
    history.replaceState(null, "", next ? `#${tour[next].id}` : location.pathname + location.search);
  }
  function step(d, via) {
    const next = stop + d;
    if (next < 0) return say(edges.start);
    if (next >= tour.length) return say(edges.end);
    goTo(next, via);
  }
  window.__go = (i) => goTo(i, "keys");

  const input = bindInput({ step, jump: (i) => goTo(i === Infinity ? tour.length - 1 : i, "keys") });
  document.querySelectorAll(".ctl").forEach((b) => b.addEventListener("click", () => step(Number(b.dataset.dir), "keys")));
  const dots = document.querySelector(".dots");
  dots.innerHTML = tour.map((t, i) => `<button type="button" aria-label="Stop ${i + 1}: ${esc(t.kicker)}" title="${esc(t.kicker)}" class="${i === 0 ? "on" : ""}"></button>`).join("");
  dots.querySelectorAll("button").forEach((b, i) => b.addEventListener("click", () => goTo(i, "keys")));
  document.addEventListener("visibilitychange", () => engine.pause(document.hidden));

  // Deep links: kush.dev/#scheduler opens straight at that stop.
  const fromHash = tour.findIndex((t) => `#${t.id}` === location.hash);
  if (fromHash > 0) {
    engine.jump(fromHash);
    goTo(fromHash, "link");
  }
  addEventListener("hashchange", () => {
    const i = tour.findIndex((t) => `#${t.id}` === location.hash);
    if (i >= 0) goTo(i, "link");
  });

  // Sound toggle.
  const sbtn = document.getElementById("sound");
  sbtn.addEventListener("click", () => {
    const on = sound.toggle();
    sbtn.setAttribute("aria-pressed", String(on));
    sbtn.textContent = on ? "sound on" : "sound off";
  });

  // Easter egg: type "rewind".
  input.onWord("rewind", () => {
    say("Rewinding time…");
    const back = () => {
      if (stop === 0) return;
      goTo(stop - 1, "keys");
      setTimeout(back, 380);
    };
    back();
  });

  // Time on page, in the current unit.
  const t0 = performance.now();
  setInterval(() => {
    const spent = (performance.now() - t0) / 1000;
    const p = timeParts(logAt(SECONDS, engine.z));
    const units = { ns: 1e-9, "µs": 1e-6, ms: 1e-3, s: 1, min: 60, h: 3600, d: 86400, mo: 2.63e6, y: 3.156e7 };
    const v = spent / units[p.unit];
    timeOn.textContent = `You've been here ${v >= 1000 || v < 0.01 ? sci(v) : v >= 10 ? Math.round(v) : v.toPrecision(2)} ${p.long}.`;
  }, 250);
}

/* ---- console puzzle ---------------------------------------------------- */
console.log(
  "%cHey, engineer.%c\nA flat FAISS index compares the query with every stored vector.\nFor n vectors of dimension d, what's the cost of one search?\nAnswer with unlock('O(...)').",
  "font: 700 16px sans-serif; color: #ffb000",
  "font: 13px monospace"
);
window.unlock = (a) => {
  const ok = String(a).replace(/\s/g, "").toLowerCase() === "o(nd)";
  if (ok) {
    const edge = document.getElementById("edge");
    edge.innerHTML = `You found it. Write to me with the subject “O(nd)”: <a href="mailto:${person.email}?subject=O(nd)">${person.email}</a>`;
    edge.classList.add("on");
    return "Correct. Check the page.";
  }
  return "Not quite. Think about what 'compares with every vector' costs.";
};

if (webglOK()) {
  start().catch((e) => {
    console.error(e);
    document.body.classList.remove("live");
    renderStill();
  });
} else {
  renderStill();
}

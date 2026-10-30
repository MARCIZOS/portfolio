/* A small copy of TaskFlow Pro's scheduling rules, so visitors can try them
 * in the browser (stop 04). The 3D Gantt and the panel widget share it.
 *
 *  - start = latest prerequisite end (end is exclusive)
 *  - a delay propagates as a maximum, never a sum: no compounding
 *  - a new link that would close a loop is rejected, with the loop spelled out
 *  - Blocked / Ready is derived, never stored */

export const TASKS = [
  { id: "A", name: "Gather requirements", dur: 3, deps: [] },
  { id: "B", name: "Design schema", dur: 3, deps: ["A"] },
  { id: "C", name: "Auth service", dur: 4, deps: ["A"] },
  { id: "D", name: "Build backend API", dur: 4, deps: ["B", "C"] },
  { id: "E", name: "Frontend", dur: 5, deps: ["A"] },
  { id: "F", name: "Review", dur: 2, deps: ["D", "E"] },
  { id: "G", name: "Launch", dur: 1, deps: ["F"] },
];
const byId = Object.fromEntries(TASKS.map((t) => [t.id, t]));

export const flow = {
  delay: 0,
  touched: 0,
  message: "",
  rejected: null,
  moved: {},
};

export function schedule(delay = flow.delay) {
  const out = {};
  for (const t of TASKS) {
    const start = t.deps.length ? Math.max(...t.deps.map((d) => out[d].end)) : 0;
    const dur = t.dur + (t.id === "A" ? delay : 0);
    out[t.id] = { start, end: start + dur, dur };
  }
  // Critical path: walk back from the end along zero-slack prerequisites.
  const crit = new Set(["G"]);
  let cur = "G";
  while (byId[cur].deps.length) {
    const s = out[cur].start;
    cur = byId[cur].deps.find((d) => out[d].end === s);
    crit.add(cur);
  }
  return { out, crit };
}

/** Shortest path from `from` to `to` along successor links, or null. */
function path(from, to) {
  const succ = {};
  for (const t of TASKS) for (const d of t.deps) (succ[d] ||= []).push(t.id);
  const prev = { [from]: null };
  const q = [from];
  while (q.length) {
    const n = q.shift();
    if (n === to) break;
    for (const m of succ[n] || []) if (!(m in prev)) (prev[m] = n), q.push(m);
  }
  if (!(to in prev)) return null;
  const p = [];
  for (let n = to; n; n = prev[n]) p.unshift(n);
  return p;
}

export const actions = {
  toggleDelay() {
    const before = schedule().out;
    flow.delay = flow.delay ? 0 : 3;
    const after = schedule().out;
    flow.moved = {};
    for (const t of TASKS) if (after[t.id].start !== before[t.id].start) flow.moved[t.id] = after[t.id].start - before[t.id].start;
    const names = Object.keys(flow.moved).map((id) => `${byId[id].name} ${flow.moved[id] > 0 ? "+" : ""}${flow.moved[id]}`);
    flow.message = flow.delay
      ? `Gather requirements slipped 3 days. Moved: ${names.join(", ")}. Build backend API waits on two delayed tasks and still moves +3, not +6.`
      : `Back on plan. Moved: ${names.join(", ")}.`;
    flow.rejected = null;
    flow.touched = performance.now();
  },
  tryCycle() {
    // Make "Gather requirements" depend on "Launch".
    const loop = path("A", "G");
    flow.rejected = loop ? [...loop, "A"] : null;
    flow.message = loop
      ? `Rejected: ${flow.rejected.map((id) => byId[id].name).join(" → ")}. That link would close a loop, so nothing was saved.`
      : "Link added.";
    flow.touched = performance.now();
  },
  reset() {
    flow.delay = 0;
    flow.moved = {};
    flow.rejected = null;
    flow.message = "Plan reset.";
    flow.touched = performance.now();
  },
};

export const nameOf = (id) => byId[id].name;

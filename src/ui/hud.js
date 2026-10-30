/* The readouts: timescale (with a split-flap unit), CPU cycles in view at
 * 3 GHz, the stop counter, and a log-scale ruler on the right edge. */

const UNITS = [
  [3.156e7, "y", "years"],
  [2.63e6, "mo", "months"],
  [86400, "d", "days"],
  [3600, "h", "hours"],
  [60, "min", "minutes"],
  [1, "s", "seconds"],
  [1e-3, "ms", "milliseconds"],
  [1e-6, "µs", "microseconds"],
  [1e-9, "ns", "nanoseconds"],
];
const SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹";

export function timeParts(sec) {
  for (const [u, short, long] of UNITS) {
    if (sec >= u * 0.999) {
      const v = sec / u;
      const num = v >= 100 ? Math.round(v).toString() : v >= 10 ? v.toFixed(1) : v.toFixed(2);
      return { num, unit: short, long };
    }
  }
  return { num: (sec / 1e-9).toFixed(2), unit: "ns", long: "nanoseconds" };
}

export function sci(v) {
  if (v > 0 && v < 0.01) {
    const e = Math.floor(Math.log10(v));
    const m = (v / 10 ** e).toFixed(1);
    return `${m} × 10⁻${String(-e)
      .split("")
      .map((d) => SUP[+d])
      .join("")}`;
  }
  if (v < 1000) return String(Math.round(v));
  let e = Math.floor(Math.log10(v));
  let m = (v / 10 ** e).toFixed(1);
  if (m === "10.0") {
    m = "1.0";
    e += 1;
  }
  return `${m} × 10${String(e)
    .split("")
    .map((d) => SUP[+d])
    .join("")}`;
}

export function logAt(values, z) {
  const i = Math.max(0, Math.min(values.length - 2, Math.floor(z)));
  const k = Math.max(0, Math.min(1, z - i));
  return Math.exp(Math.log(values[i]) + (Math.log(values[i + 1]) - Math.log(values[i])) * k);
}

const DECADE = ["1 ns", "10 ns", "100 ns", "1 µs", "10 µs", "100 µs", "1 ms", "10 ms", "100 ms", "1 s", "10 s", "100 s", "~17 min", "~3 h", "~1 day", "~12 days", "~4 months", "~3 years"];
const STEP = 46;

export function createHud(root) {
  const num = root.querySelector("#hud-num");
  const unit = root.querySelector("#hud-unit");
  const cycles = root.querySelector("#hud-cycles");
  const ruler = root.querySelector("#ruler-tape");
  ruler.innerHTML = DECADE.map((d, i) => `<div class="tick" style="top:${i * STEP}px"><span>${d}</span></div>`).join("");
  let last = "";
  let lastUnit = "";
  return function set(sec) {
    const p = timeParts(sec);
    const c = sci(sec * 3e9);
    const key = p.num + p.unit + c;
    if (key !== last) {
      last = key;
      num.textContent = p.num;
      cycles.textContent = c;
      if (p.unit !== lastUnit) {
        lastUnit = p.unit;
        unit.classList.remove("flip");
        void unit.offsetWidth;
        unit.classList.add("flip");
        unit.textContent = p.unit;
      }
    }
    const d = Math.log10(sec) + 9;
    ruler.style.transform = `translateY(${-d * STEP}px)`;
    return p;
  };
}

/* Off by default. When on: a soft tick at each stop that drops in pitch as
 * time gets longer, an alarm at the crash, a two-note chime at recovery.
 * Pure Web Audio oscillators, no files. */

export function createSound() {
  let ctx = null;
  let on = false;
  function ensure() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
  }
  function tone(freq, dur, { type = "sine", gain = 0.08, at = 0 } = {}) {
    if (!on) return;
    ensure();
    const t = ctx.currentTime + at;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + dur + 0.05);
  }
  return {
    get on() {
      return on;
    },
    toggle() {
      on = !on;
      if (on) ensure();
      return on;
    },
    stop(i) {
      tone(1400 * 2 ** (-i / 2.6), 0.18, { type: "triangle" });
    },
    alarm() {
      tone(660, 0.16, { type: "square", gain: 0.04 });
      tone(520, 0.16, { type: "square", gain: 0.04, at: 0.2 });
    },
    chime() {
      tone(784, 0.4, { gain: 0.06 });
      tone(1175, 0.6, { gain: 0.05, at: 0.12 });
    },
  };
}

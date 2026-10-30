/* Wheel, keys and swipes all become step(+1) or step(-1).
 * Wheel: one gesture, one stop. Deltas accumulate until they pass 24 px;
 * the gesture ends after 160 ms of quiet, so trackpad inertia can't skip.
 * Keys: held keys repeat at most once per 450 ms.
 * Swipe: at least 50 px, mostly vertical, and only once the text sheet has
 * nothing left to scroll that way. */

export function bindInput({ step, jump, panel }) {
  let acc = 0;
  let lastWheel = 0;
  let armed = true;
  addEventListener(
    "wheel",
    (e) => {
      if (e.ctrlKey) return;
      const inPanel = e.target.closest?.(".panel");
      if (inPanel) {
        const canDown = inPanel.scrollTop + inPanel.clientHeight < inPanel.scrollHeight - 2;
        const canUp = inPanel.scrollTop > 2;
        if ((e.deltaY > 0 && canDown) || (e.deltaY < 0 && canUp)) return;
      }
      e.preventDefault();
      const now = performance.now();
      if (now - lastWheel > 160) {
        armed = true;
        acc = 0;
      }
      lastWheel = now;
      if (!armed) return;
      acc += e.deltaY;
      if (Math.abs(acc) > 24) {
        step(Math.sign(acc), "wheel");
        armed = false;
      }
    },
    { passive: false }
  );

  let lastKey = 0;
  addEventListener("keydown", (e) => {
    if (e.target.closest?.("input, textarea, select")) return;
    const fwd = ["ArrowDown", "ArrowRight", "PageDown", " "].includes(e.key);
    const back = ["ArrowUp", "ArrowLeft", "PageUp"].includes(e.key);
    if (/^[1-9]$/.test(e.key)) return jump(Number(e.key) - 1);
    if (e.key === "Home") return jump(0);
    if (e.key === "End") return jump(Infinity);
    if (!fwd && !back) return;
    e.preventDefault();
    if (e.repeat && performance.now() - lastKey < 450) return;
    lastKey = performance.now();
    step(fwd ? 1 : -1, "keys");
  });

  let ty = null;
  let tx = null;
  let startScroll = 0;
  let inPanel = null;
  addEventListener(
    "touchstart",
    (e) => {
      if (e.touches.length !== 1 || e.target.closest("a, button, input, textarea")) return (ty = null);
      ty = e.touches[0].clientY;
      tx = e.touches[0].clientX;
      inPanel = e.target.closest(".panel");
      startScroll = inPanel ? inPanel.scrollTop : 0;
    },
    { passive: true }
  );
  addEventListener(
    "touchend",
    (e) => {
      if (ty == null) return;
      const dy = ty - e.changedTouches[0].clientY;
      const dx = tx - e.changedTouches[0].clientX;
      ty = null;
      if (Math.abs(dy) < 50 || Math.abs(dx) > Math.abs(dy)) return;
      if (inPanel) {
        const scrolled = Math.abs(inPanel.scrollTop - startScroll) > 2;
        const canMore = dy > 0 ? inPanel.scrollTop + inPanel.clientHeight < inPanel.scrollHeight - 2 : inPanel.scrollTop > 2;
        if (scrolled || canMore) return;
      }
      step(Math.sign(dy), "touch");
    },
    { passive: true }
  );

  // Typed words: "rewind" plays the tour backwards.
  let typed = "";
  const words = {};
  addEventListener("keypress", (e) => {
    if (e.target.closest?.("input, textarea")) return;
    typed = (typed + e.key).slice(-12).toLowerCase();
    for (const w of Object.keys(words)) if (typed.endsWith(w)) words[w]();
  });
  return {
    onWord(w, f) {
      words[w] = f;
    },
  };
}

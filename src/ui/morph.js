/* The panel never fades between stops. Every string scrambles and resolves
 * into its new words, left to right with a small stagger, while the panel
 * eases to its new height. */

const GLYPHS = "abcdefghijklmnopqrstuvwxyz0123456789#%&*+<>/";

function textNodes(root) {
  const out = [];
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (n.nodeValue.trim() && !n.parentElement.closest("[data-nomorph]") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
  });
  while (w.nextNode()) out.push(w.currentNode);
  return out;
}

export function createMorph(el, { reduced = false } = {}) {
  let raf = 0;
  return function morph(html, { dur = 900 } = {}) {
    cancelAnimationFrame(raf);
    const before = textNodes(el).map((n) => n.nodeValue);
    const h0 = el.offsetHeight;
    el.innerHTML = html;
    el.scrollTop = 0;
    if (reduced) return;
    const nodes = textNodes(el);
    const after = nodes.map((n) => n.nodeValue);
    const h1 = el.offsetHeight;
    el.style.transition = "none";
    el.style.height = `${h0}px`;
    el.getBoundingClientRect();
    el.style.transition = `height ${dur * 0.7}ms cubic-bezier(.3,.7,.2,1)`;
    el.style.height = `${h1}px`;
    setTimeout(() => (el.style.height = ""), dur * 0.72);

    const jobs = nodes.map((n, i) => ({ n, from: before[i] || "", to: after[i], delay: Math.min(0.35, i * 0.018) }));
    const t0 = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - t0) / dur);
      for (const j of jobs) {
        const k = Math.max(0, Math.min(1, (p - j.delay) / (1 - j.delay)));
        if (k >= 1) {
          if (j.n.nodeValue !== j.to) j.n.nodeValue = j.to;
          continue;
        }
        const len = Math.round(j.from.length + (j.to.length - j.from.length) * Math.min(1, k * 1.6));
        const done = Math.floor(j.to.length * k * k);
        let s = "";
        for (let c = 0; c < len; c += 1) {
          const target = j.to[c] ?? "";
          if (c < done) s += target;
          else if (target === " ") s += " ";
          else if (c > done + 20 && j.from[c]) s += j.from[c];
          else s += GLYPHS[(Math.random() * GLYPHS.length) | 0];
        }
        j.n.nodeValue = s;
      }
      if (p < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
  };
}

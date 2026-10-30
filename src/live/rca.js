import { live } from "../content.js";

/* The search box on stop 04.
 *
 * With `live.api` set, it calls POST /api/rca/search on the real FAISS
 * service. Without it, it runs a small in-browser stand-in: a handful of
 * example incidents, matched by cosine similarity over word counts. The
 * UI labels which one answered. */

const INCIDENTS = [
  ["INC-0412", "connection pool exhausted", "timeout acquiring connection from pool postgres too many clients", "Raise pool size; add backoff on acquire"],
  ["INC-0388", "worker OOM-killed", "worker killed signal 9 out of memory oom sigkill heartbeat missed", "Cap batch size; set memory limit and restart policy"],
  ["INC-0291", "slow query on jobs table", "slow query seq scan jobs table latency p99 high missing index", "Add index on (state, run_at)"],
  ["INC-0377", "Redis connection refused", "redis connection refused econnrefused 6379 queue unavailable", "Restart Redis; add health check and retry"],
  ["INC-0254", "TLS certificate expired", "ssl certificate expired handshake failed https error", "Renew certificate; alert 14 days before expiry"],
  ["INC-0466", "disk full on log volume", "no space left on device disk full write failed logs", "Rotate logs; move to S3 lifecycle"],
  ["INC-0319", "rate limit from upstream API", "429 too many requests rate limit upstream throttled", "Token bucket client; exponential backoff"],
  ["INC-0402", "deadlock in job updates", "deadlock detected transaction rollback update jobs lock", "Consistent lock order; shorter transactions"],
  ["INC-0355", "DNS resolution failure", "dns lookup failed getaddrinfo enotfound name resolution", "Cache DNS; fall back to secondary resolver"],
  ["INC-0431", "duplicate job execution", "job ran twice duplicate idempotency key missing retry", "Idempotency keys; exactly-once claim in Redis"],
];

const words = (s) => s.toLowerCase().match(/[a-z0-9]+/g) || [];
function vec(s) {
  const m = new Map();
  for (const w of words(s)) m.set(w, (m.get(w) || 0) + 1);
  return m;
}
function cos(a, b) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (const [, v] of a) na += v * v;
  for (const [, v] of b) nb += v * v;
  for (const [k, v] of a) dot += v * (b.get(k) || 0);
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}
const INDEX = INCIDENTS.map(([id, title, text, fix]) => ({ id, title, fix, v: vec(`${title} ${text}`) }));

export async function searchIncidents(query) {
  if (live.api) {
    try {
      const r = await fetch(`${live.api}/api/rca/search`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: query.slice(0, 500) }) });
      if (r.ok) return { source: "live", matches: (await r.json()).matches };
    } catch {
      /* fall through to the demo */
    }
  }
  const q = vec(query);
  const matches = INDEX.map((d) => ({ id: d.id, title: d.title, fix: d.fix, score: cos(q, d.v) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  return { source: "demo", matches };
}

import { live, stats } from "../content.js";

/* LeetCode numbers. A GitHub Action writes data.json every 6 hours (see
 * api/github-action-stats.yml); if `live.stats` points at it, the site uses
 * those numbers, otherwise it keeps the ones in content.js. */

export const current = structuredClone(stats);

export const ready = live.stats
  ? fetch(live.stats)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.leetcode) Object.assign(current.leetcode, d.leetcode);
        return current;
      })
      .catch(() => current)
  : Promise.resolve(current);

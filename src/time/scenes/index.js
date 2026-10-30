import { core, dram, keyspace } from "./micro.js";
import { vectors, blink } from "./data.js";
import { gantt, match, bill, exam } from "./projects.js";
import { contest, hackathon, calendar, market, timeline } from "./life.js";

/* Shortest timescale first. Each scene holds the one before it, so the
 * order here must match the order of `tour` in content.js. */
export function buildScenes({ stats }) {
  return [core(), dram(), keyspace(), gantt(), vectors(), blink(), match(), bill(), contest(stats), exam(), hackathon(), calendar(), market(), timeline()];
}

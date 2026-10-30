# Powers of Time — Kush Agarwal's portfolio

One continuous zoom through time, from a 1 ns cache hit to a 4-year degree.
Each stop is nested inside the next, and each project sits at the timescale
where it naturally happens:

| Stop | Timescale | What's there |
| --- | --- | --- |
| 01 | 1 ns | Hero: a cache hit inside a CPU core |
| 02 | 100 ns | About: a RAM read |
| 03 | 1 µs | Skills: a Redis GET |
| 04 | under 1 ms | **TaskFlow Pro** (Grand Prize) with a working dependency-engine demo |
| 05 | milliseconds | **AI Log Analyzer & RCA**: FAISS search over past incidents, with a search box |
| 06 | 300 ms | A blink |
| 07 | ~40 s | **Rank Radar**: one ball of a simulated match |
| 08 | 10 min | **FairFix**: a service bill checked line by line |
| 09 | 90 min | LeetCode contest rating |
| 10 | 3 h | **AI Exam Generator & Evaluator** |
| 11 | 1 day | Hackathons |
| 12 | 2 months | LetsGrowMore internship |
| 13 | 1 year | **ARAIA**: a market stress year |
| 14 | 4 years | Contact |

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # static site in dist/
```

Deploy `dist/` anywhere static: on Vercel, import the repo (framework: Vite).

## Change things

- **All words** live in `src/content.js` (tour, projects, links, LeetCode numbers).
- **Scenes** live in `src/time/scenes/`. The order in `scenes/index.js` must match `tour`.
- **Engine** (`src/time/engine.js`): one number `z` drives the camera, HUD and colour.
- **Live data** (`live` in `content.js`): set `api` to a FastAPI service exposing
  `POST /api/rca/search` to make the log-search box real, and `stats` to a raw
  `data.json` URL (from a scheduled GitHub Action) to keep LeetCode numbers fresh.
  With both `null`, the site uses built-in demos and labels them as demos.

## Controls

Scroll, swipe, ↑ ↓ or the buttons move one stop. Number keys jump; drag to tilt
the camera. Deep links work: `/#taskflow`, `/#araia`, `/#contact`.
Easter eggs: type `rewind`; open the browser console.

Fallbacks: no WebGL → a plain scrolling page; reduced motion → no camera
flights; "Skip the ride" → `resume.html`.

Inspired by the scale-zoom idea in Sudhanshu Shukla's portfolio; this site
zooms through time instead of space, with its own scenes and code.

/* Every word on the site lives here. `tour` is the order of the stops, one
 * per scene, from 1 nanosecond to 4 years. Each project sits at the
 * timescale where it naturally happens. Change copy here, never in the 3D
 * code. */

export const person = {
  name: "Kush Agarwal",
  role: "Backend engineer",
  email: "kushagarwal0805@gmail.com",
  resume: "./resume.html",
  links: {
    github: "https://github.com/MARCIZOS",
    linkedin: "https://www.linkedin.com/in/kushagarwal0805/",
    leetcode: "https://leetcode.com/u/kush0809/",
  },
};

/* Live sources. Leave a URL null to use the built-in demo instead.
 * api: a FastAPI service exposing POST /api/rca/search (the log analyzer).
 * stats: raw URL of data.json written by the GitHub Action. */
export const live = {
  api: null,
  stats: null,
};

/* Numbers baked in at build time; stats.js replaces them if `live.stats` loads. */
export const stats = {
  leetcode: { rating: 1938, badge: "Knight", solved: 558 },
};

const gh = (repo) => `https://github.com/MARCIZOS/${repo}`;

export const tour = [
  {
    id: "hello",
    scene: "core",
    seconds: 1e-9,
    kicker: "1 nanosecond",
    title: "Kush Agarwal",
    hero: true,
    body: [
      "Backend engineer. B.Tech CSE (AI) at NIET, graduating 2027.",
      "You're looking at one nanosecond: a single cache hit inside a CPU core. Scroll, and time gets longer at every step. Six projects are on the way, each at the timescale where it lives.",
    ],
  },
  {
    id: "about",
    scene: "dram",
    seconds: 1e-7,
    kicker: "100 nanoseconds · a RAM read",
    title: "Hi, I'm Kush",
    body: [
      "That cache hit just happened inside one read from memory. Every stop from here contains the one before it.",
      "I build the parts of software nobody sees: schedulers, pipelines, APIs and the rules that keep them honest. My projects share one habit: code computes the numbers, and AI only explains them.",
      "B.Tech in Computer Science (AI), NIET, 2023 to 2027. CGPA 8.66.",
    ],
  },
  {
    id: "skills",
    scene: "keyspace",
    seconds: 1e-6,
    kicker: "1 microsecond · a Redis GET",
    title: "What I work with",
    groups: [
      ["Languages", "C++, Python, SQL, JavaScript"],
      ["Backend", "FastAPI, Node.js, Express, REST API design"],
      ["Data", "PostgreSQL, MySQL, MongoDB, Redis, FAISS"],
      ["Cloud", "AWS (EC2, S3), Docker, Git"],
      ["Core CS", "DSA, OOP, operating systems, networks, DBMS"],
    ],
  },
  {
    id: "taskflow",
    scene: "gantt",
    seconds: 1e-3,
    kicker: "under 1 millisecond · 1,000 tasks re-planned",
    title: "TaskFlow Pro",
    badge: "Grand Prize · Contata NCR Hackathon 2026",
    project: {
      line: "A Kanban board that understands task dependencies. Its engine refuses circular links, works out which tasks are Blocked or Ready, and moves later tasks automatically when an earlier one slips, without ever counting the same delay twice.",
      detail: "Under 1 ms to propagate a delay through 1,000 tasks and 3,000 links, with critical-path highlighting and AI-suggested dependencies that a person must accept. Try the rules below.",
      tech: ["Python", "FastAPI", "React", "PostgreSQL", "dnd-kit", "Docker"],
      repo: gh("taskflow-pro"),
    },
    live: "taskflow",
  },
  {
    id: "rca",
    scene: "vectors",
    seconds: 2e-2,
    kicker: "milliseconds · has this failed before?",
    title: "AI Log Analyzer & Root-Cause Analysis",
    project: {
      line: "Ingests application logs, detects failures and anomalies, groups them into incidents, retrieves similar past incidents and runbooks with FAISS, and writes evidence-based root-cause reports that never claim more than the logs support.",
      detail: "Redis Streams ingestion that scales by adding consumers; when a worker dies, its pending messages are reclaimed. Each dot here is a past incident: a new error lands and its nearest neighbours light up. Try it below.",
      tech: ["Python", "FastAPI", "PostgreSQL", "Redis Streams", "FAISS", "Ollama", "React", "Docker"],
      repo: gh("log_analyzer"),
    },
    live: "rca",
  },
  {
    id: "blink",
    scene: "blink",
    seconds: 0.3,
    kicker: "300 milliseconds · a blink",
    title: "You just blinked",
    body: [
      "A blink takes about 300 milliseconds. A cache hit, a memory read, 1,000 tasks re-planned and a vector search all fit inside one.",
      "From here on, time is slow enough for people: a cricket ball, a service bill, an exam, a hackathon, a market year.",
    ],
  },
  {
    id: "rankradar",
    scene: "match",
    seconds: 40,
    kicker: "about 40 seconds · one ball",
    title: "Rank Radar",
    project: {
      line: "A live-match companion for fantasy cricket fans. It explains why your rank moved on every ball, tells you who to cheer for next, catches you up after you look away, and tracks all your teams at once, in English, Hinglish or Hindi.",
      detail: "A seeded ball-by-ball match engine scores 2,500 rival teams to compute your rank. The numbers are computed; the AI only explains them, so it can't invent one.",
      tech: ["JavaScript", "CSS", "Claude", "Netlify"],
      repo: gh("Rank-Radar"),
      site: "https://subtle-meringue-e283eb.netlify.app/",
    },
  },
  {
    id: "fairfix",
    scene: "bill",
    seconds: 600,
    kicker: "10 minutes · at the billing counter",
    title: "FairFix",
    badge: "Built for the Nebius × NVIDIA Global AI Hackathon",
    project: {
      line: "A second opinion on your vehicle service bill, before you pay. Photograph the bill and the estimate; FairFix reads every line and checks it against the official service schedule, comparable part prices, warranty and recall information.",
      detail: "Models read, code decides: NVIDIA Nemotron extracts the lines, deterministic rules make every call, and each result shows its evidence. It drafts a polite question for the service advisor, and says \"unable to verify\" instead of guessing.",
      tech: ["Python", "Pydantic", "NVIDIA Nemotron", "Nebius", "Tavily", "OCR"],
      repo: gh("fairfix"),
    },
  },
  {
    id: "contest",
    scene: "contest",
    seconds: 5400,
    kicker: "90 minutes · a contest",
    title: "Competitive programming",
    cp: true,
    body: ["Ninety minutes is one LeetCode contest. This is where the algorithms behind everything else get practice."],
  },
  {
    id: "examgen",
    scene: "exam",
    seconds: 10800,
    kicker: "3 hours · an exam",
    title: "AI Exam Generator & Evaluator",
    project: {
      line: "Turns a chapter into a question paper and grades the answers. Upload a PDF; it drafts multiple-choice, short-answer and coding questions. Photograph handwritten answers; OCR reads them and the evaluator scores each section with feedback.",
      detail: "Per-question feedback, missed keywords highlighted, a letter grade, and uploads deleted after every request.",
      tech: ["Node.js", "Express", "Groq", "Tesseract.js OCR", "pdf-parse"],
      repo: gh("ai_exam_generator"),
    },
  },
  {
    id: "hackathons",
    scene: "hackathon",
    seconds: 86400,
    kicker: "1 day · a hackathon",
    title: "Built under a deadline",
    points: [
      "Grand Prize, Contata NCR Hackathon 2026, with TaskFlow Pro.",
      "Top 10 of 120+ teams at HackO'Clock, a national-level hackathon.",
      "FairFix, built for the Nebius × NVIDIA Global AI Hackathon (Best Apps & Agents track).",
    ],
  },
  {
    id: "internship",
    scene: "calendar",
    seconds: 5.3e6,
    kicker: "2 months · an internship",
    title: "Python Developer, LetsGrowMore",
    meta: "July to August 2024",
    points: [
      "Worked with product stakeholders to scope features and turn them into technical specs, delivered through code review within sprint deadlines.",
      "Built Python automation scripts with Pandas and Flask that cut manual effort in recurring data-processing work.",
    ],
  },
  {
    id: "araia",
    scene: "market",
    seconds: 3.15e7,
    kicker: "1 year · a market under stress",
    title: "ARAIA",
    badge: "Live on AWS",
    project: {
      line: "When correlations converge in a crisis, how much of your diversification is real? ARAIA re-prices a portfolio inside a simulated macroeconomic shock, finds the correlation cluster carrying the most risk, retrieves diversifiers with FAISS and proposes a bounded reallocation.",
      detail: "Then it measures the change instead of asserting it: a 59% reduction in simulated stressed drawdown. Every number is computed deterministically; the language model only explains.",
      tech: ["Python", "FastAPI", "React", "FAISS", "SciPy", "AWS EC2 + S3"],
      repo: gh("portfolio_diversification"),
    },
  },
  {
    id: "contact",
    scene: "timeline",
    seconds: 1.26e8,
    kicker: "4 years · a degree",
    title: "Next stop: your team",
    contact: true,
    body: ["Every stop you passed is a dot on this line, 2023 to 2027. I'm looking for a software engineering or backend internship on systems with real load behind them."],
    last: true,
  },
];

/* Said when you try to go past either end. */
export const edges = {
  start: "In under a nanosecond, light only travels 30 cm. Even I can't optimise that.",
  end: "After this it's the future. That part depends on whether you hire me.",
};

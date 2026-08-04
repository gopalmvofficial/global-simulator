# Meridian Holdings — Global Business Empire Simulator (Phase 1)

A browser-based business tycoon game. Pure HTML5 + CSS3 + vanilla ES6+ JavaScript modules —
no framework, no build step, no game engine. Open `index.html` (via a local server, since
ES modules require `http://` not `file://`) and play.

```
npx serve .
# or: python3 -m http.server 8000
```

## What's real in Phase 1

- **Profiles & login**: multiple local profiles with avatars, stored in `localStorage`.
- **Save system**: 3 save slots per profile in **IndexedDB** (large payload, async, non-blocking),
  autosave on every game tick, manual save, JSON export/import. Nothing ever reloads the page.
- **World map**: 12 cities across 6 fictional countries with population, GDP, tax rate and
  growth, rendered as an SVG-style pulsing node map (pure CSS/HTML, no image assets).
- **8 business sectors** (Banking, Tech, Media, Real Estate Dev, Retail, Hospitality, Energy,
  Sports) with 21 ownable companies, each with real weekly income/expense math.
- **Executives**: 8 roles, 12 hireable candidates, each with a real salary cost and a real
  performance multiplier on the company they're assigned to.
- **Stock exchange**: 10 NPC public companies with live-drifting prices, dividends, buy/sell,
  and hostile-takeover acquisition past a majority-share threshold (which also raises your
  regulatory heat). You can also take your own companies public via IPO (founder shares +
  public float, priced off real company valuation) and split their shares 2-for-1.
- **Banking**: savings with weekly interest, fixed-term deposits, and loans whose limit and
  rate are driven by a real credit-rating formula (net worth, debt ratio, reputation, heat).
- **Real estate**: land + 5 building types per city, weekly rent, slow appreciation, resale.
- **Luxury store**: 9 prestige assets from sports cars to private islands.
- **Legal system**: expansion and leverage generate real regulatory "heat"; past a threshold
  it can spawn an actual legal case (tax audit, antitrust inquiry, etc.) that costs cash and
  reputation to settle.
- **Dynamic world events**: booms, recessions, crashes, sector-specific tech breakthroughs,
  trade agreements, scandals — each with a real multiplier applied to every company's income
  and to stock price drift for the event's duration.
- **AI rivals**: 10 competing entrepreneurs whose net worth actually grows every tick (faster
  on higher difficulty), ranked against you on a live leaderboard.
- **Difficulty levels**: Easy/Normal/Hard/Legendary change starting capital and AI growth speed.
- **Dark/light theme toggle**, saved to `localStorage`.

Every one of the above is wired end-to-end and was smoke-tested with a scripted playthrough
(buy companies, hire executives, take a loan, buy/sell stock, IPO a company, run 30+ ticks) —
not just rendered UI with no logic behind it.

## What's intentionally shallow right now (by design, not oversight)

This is one phase of a spec that — in full — is a multi-year AAA scope (see the project brief).
Rather than fake breadth with non-functional stubs, Phase 1 goes deep on a working core loop
and leaves clearly-scoped gaps for the next phases:

- Only one "difficulty" of AI behavior (steady compounding growth) — no AI companies actually
  buying/selling on the exchange yet, no AI-vs-AI mergers.
- No multi-division holding companies / corporate parent-subsidiary structure yet.
- No movie/media production pipeline, franchise ownership depth, or match-day sports engine —
  sports and media are ownable "companies" with income, not full sub-simulations.
- No currency exchange / multi-currency economy, no bond market.
- Legal system has one resolution path (pay to settle) — no court cases you can fight or lose.
- No cloud save — export/import JSON is the cross-device path for now.

## Architecture

```
index.html
css/style.css
js/
  data.js     — all static config (cities, sectors, companies, executives, stocks, events...)
  db.js       — IndexedDB save-slot storage + localStorage profiles/settings
  state.js    — fresh-state factory + pure derived-value helpers (net worth, credit rating...)
  engine.js   — advanceTick(state) -> state, the entire simulation step, pure function
  actions.js  — every player action as a pure (state, ...args) -> state reducer
  ui.js       — pure render functions: (state, ctx) -> HTML string, no DOM writes
  main.js     — the only file that touches the DOM: routing, event delegation, game loop
```

Everything in `engine.js` and `actions.js` is a pure function with no DOM dependency, so it's
independently testable in plain Node (which is how this was verified before shipping).

## Suggested Phase 2

Real estate districts & renovation depth, AI companies actually trading on the exchange,
corporate holding structures (own a company that owns companies), bond market, multi-currency
FX, and a proper court-case mini-flow for the legal system.

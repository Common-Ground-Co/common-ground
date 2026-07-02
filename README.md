# Common Ground

A curated directory of adult dance studios in Chicago. Find classes by style, level, or studio with live schedules scraped daily from each studio's website.

Currently in beta with 5 dancers.

> **Note:** This project is still under active development. Some features described here may be partially implemented, in progress, or being reworked.

**[Live App](https://common-ground-1-0gsv.onrender.com/)**

---

## Demo

[![Watch the demo](https://cdn.loom.com/sessions/thumbnails/LOOM_ID-with-play.gif)](https://www.loom.com/share/LOOM_ID)

---

## Tech Stack

**Frontend** — React 19, React Router 7, Vite

**Backend** — Express.js, PostgreSQL

**Scraping** — Puppeteer (headless browser scraping for live class schedules)

**Infra** — Render (backend + database), Vercel (frontend), Cronitor (cron monitoring)

---

## Features

- Browse Chicago dance studios with style filters and studio info
- Live class schedules scraped from each studio's website, updated daily via cron job
- Filter classes by style, level, and studio name
- Anonymous studio reviews with author-controlled edit and delete
- IG Class Radar page for finding classes through studio Instagram accounts
- Admin page for managing studio content (add, edit, delete)
- Centralized scraper config — adding a new studio requires one file entry, no new scraper file

**Studios currently scraped:** Puzzle Box, Visceral Dance Center, Indie Media, Dance Forever

---

## Scraping

One centralized scraper handles every studio — there is no per-studio scraping code. Each studio in `server/scrapers/studios.config.js` provides only facts (id, name, schedule URL, style filters); *how* its page is scraped lives in a **scrape schema** (`server/scrapers/scrapeSchemas/<key>.json`) describing selectors and pagination behavior.

1. When a studio is first scraped, Puppeteer loads the page (including embedded booking-widget iframes), captures the DOM, and sends it to an LLM (Claude Haiku via OpenRouter), whose only job is to write the scrape schema — it never extracts class data itself.
2. Every scrape after that executes the cached schema with Puppeteer alone — no LLM call, no cost.
3. A validation pass checks every scrape: if the schema returns no usable rows (site redesigned, selectors dead), it's regenerated automatically on that run.

All semantic work (date/time normalization, genre/skill-level parsing) happens in `server/scrapers/normalize.js`, after extraction — schemas stay purely structural.

Requires `OPENROUTER_API_KEY` in `server/.env` (only used when a scrape schema must be generated).

Run scrapers manually with `cd server && node scrapers/runScrapers.js [studioKey]`; add `DRY_RUN=1` to skip DB writes and `DEBUG=1` for verbose output.

---

## Project Structure

```
common-ground/
├── client/                  # React frontend (Vite)
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── services/
│       └── css/
└── server/                  # Express backend
    ├── config/              # Database connection + schema
    ├── controllers/         # Route handlers
    ├── routes/              # API route definitions
    ├── scrapers/            # Puppeteer scraping scripts + shared config
    └── data/                # Seed data + studios.json snapshot
```

---

## Roadmap

### Planned

- [ ] Add more dance studios
- [ ] Studio detail page — payment method pop-up
- [ ] Better display of studio payment alternatives (drop-in, class packs, memberships)
- [ ] Wrap app with Capacitor for mobile (modern Cordova alternative)

### Future

- [ ] Full CMS for managing all site content
- [ ] Instagram page redesign
- [ ] Embedded or live per-studio class schedule on studio detail page
- [ ] Error handling layer
- [ ] Logging service
- [ ] Full mobile app

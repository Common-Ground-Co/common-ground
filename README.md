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

**Scraping** — Puppeteer (headless browser scraping for live class schedules), [chrono-node](https://github.com/wanasit/chrono) (date/time parsing)

**Infra** — Render (backend + database), Vercel (frontend), Cronitor (cron monitoring)

---

## Features

- Browse Chicago dance studios with style filters and studio info
- Live class schedules scraped from each studio's website, updated daily via cron job
- Filter classes by style, level, and studio name
- Anonymous studio reviews with author-controlled edit and delete
- IG Class Radar page for finding classes through studio Instagram accounts
- Admin page for managing studio content (add, edit, delete)
- Separate scraper files per studio using hardcoded selectors, sharing one normalization layer

**Studios currently scraped:** Puzzle Box, Visceral Dance Center, Indie Media

**Configured but pending a scraper rewrite:** Dance Forever (has a config entry in `studios.config.js` but no scraper file yet, so it's skipped on every run)

---

## Scraping

Each studio gets its own scraper file (`server/scrapers/implementations/<key>Scraper.js`) with hardcoded selectors for that studio's site. There is no shared parsing logic that tries to work generically across every studio, since every studio's website is built differently.

Adding a new studio is a manual process:

1. Open the studio's schedule page and inspect it in the browser to grab the real selectors and attributes needed for the class name, instructor, date and time, and booking link.
2. Hand those selectors to AI to write a new Puppeteer scraper script for that studio, following the pattern of an existing scraper file.
3. Decide the fastest way for Puppeteer to actually get at the data on that page. Some studios need iframe detection, some need clicking a Load More button repeatedly, some need scrolling, whatever that specific site requires.
4. Add the studio's facts (id, name, schedule URL, style filters, skip keywords) to `server/scrapers/studios.config.js`, and register the new scraper function in `server/scrapers/scrapePipeline.js`.

All semantic work (date and time normalization, genre and skill level parsing, filtering) happens afterward in `server/scrapers/normalize.js`, shared across every studio. Scraper files only get raw text and links off the page. Date and time parsing runs on [`chrono-node`](https://github.com/wanasit/chrono), since scraped date text shows up in inconsistent formats across studios (e.g. "Mon 7pm", "7/13 7:00 PM", "Tuesdays at 6:30").

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
    │   ├── implementations/ # Per-studio scraper files
    │   └── tests/           # Dry-run/debug harness (no DB writes)
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

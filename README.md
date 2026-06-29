# Common Ground

A curated directory of adult dance studios in Chicago. Find classes by style, level, or studio with live schedules scraped daily from each studio's website.

Currently in beta with 5 dancers.

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
- [ ] Review protection — rate limiting or lightweight auth to prevent spam without requiring full accounts
- [ ] Refactor data seeding to use JSON instead of JS objects
- [ ] Refactor backend to separate responsibilities across layers
- [ ] Explore IFTTT for automated API calls
- [ ] Wrap app with Capacitor for mobile (modern Cordova alternative)

### Future

- [ ] Full CMS for managing all site content
- [ ] Instagram page redesign
- [ ] Embedded or live per-studio class schedule on studio detail page
- [ ] Error handling layer
- [ ] Logging service
- [ ] Full mobile app

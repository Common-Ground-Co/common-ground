# Common Ground

A curated directory of adult dance studios in Chicago, with class schedules, reviews, and filters that help you find a class.

---

## Tech Stack

**Frontend** — React 19, React Router 7, Vite

**Backend** — Node.js, Express 5, PostgreSQL

**Scraping** — Puppeteer (headless browser scraping for live class schedules)

---

## Project Structure

```
common-ground/
├── client/          # React frontend (Vite)
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── services/
│       └── css/
└── server/          # Express backend
    ├── config/      # Database connection + schema
    ├── controllers/ # Route handlers
    ├── routes/      # API route definitions
    ├── scrapers/    # Puppeteer scraping scripts
    └── data/        # Seed data + studios.json snapshot
```

# Common Ground - Dev Timeline

## April 18–19, 2026

### Changes

- First commit, initial project setup
- Set up separate client and server folders
- Set up Express backend and React (Vite) frontend

## April 22, 2026

### Changes

- Built homepage: hero banner, polaroid decoration, search bar, style filter pills, featured studios grid
- Built nav bar and studios listing page
- Built first scraper (Puzzle Box)
- Wrote script to run all scrapers and save results to the database

## April 24, 2026

### Changes

- Restyled all pages
- Scrapers now pull 8 days of classes from scrape time instead of a fixed window
- Added a fade/mask effect so panels blend into the background photo

## April 25, 2026

### Changes

- Added API endpoints for IG accounts, classes, and reviews
- Renamed Community Radar to IG Class Radar everywhere
- Another restyling pass

### Setbacks

- CORS errors when deploying the frontend
- Took 4 commits to fix: installed the `cors` package, updated config, added env vars

## April 28, 2026

### Changes

- Added anonymous studio reviews (poster can edit/delete their own)
- Refined card heading typography

## April 29, 2026

### Changes

- Minor miscellaneous changes

## May 20, 2026

### Changes

- Built the Indie Media scraper
- Updated the UI, added a filter to the class schedule page

## June 25, 2026

### Changes

- Built admin CMS at `/admin/studios` (add/edit/delete studios via a form)
- Added GET, POST, PUT, DELETE API endpoints
- Studios JSON file now stays in sync with the database after every change
- Added Dance Forever scraper
- Added instructor name extraction/storage for all 4 scrapers
- Added instructor display to the class schedule UI

### Setbacks

- Admin page returned blank HTML instead of JSON since the Vite dev proxy only forwards `/api/*`; fixed by moving admin routes under `/api/admin/studios`
- Dance Forever uses a different widget (Ribbon, not Squarespace's event list), so selectors were wrong; scraper had to be rewritten
- CSS selectors can't start with a number, so `#25062026` broke; fixed with `[id="25062026"]`
- Duplicate classes showed up because the widget renders the whole week at once; fixed by scoping the query to the clicked day's ID
- Classes saved under the wrong dates; fixed by reading the date from `#selected_date` instead of the `data-id` attribute

## June 26, 2026

### Changes

- Added plain English comments to all CSS files
- Updated README with setup/install instructions
- Updated browser tab icon to the CG logo

## June 27, 2026

### Changes

- Fixed the Visceral scraper breaking after Wix changed the widget iframe's CDN URL
- Now tries multiple URL patterns and falls back to scanning all frames
- Set up a daily 10am cron job with Cronitor monitoring to auto-scrape all studios

## June 28, 2026

### Changes

- Reworked the scraping system: adding a new studio now just needs one entry in a central config file, no new scraper file
- Each studio's URL, style filters, and site type now live in one place
- Expanded the class window from 8 to 12 days out

### Setbacks

- Tried using a local AI model (Ollama) to auto-read schedule pages
- AI invented classes, got dates wrong, and missed most classes — not reliable
- Scrapped it for the centralized config system instead

## June 28, 2026 (UI overhaul)

### Changes

- Redesigned every page for a consistent look
- Cleaned up visual clutter, removed unused elements
- Fixed uneven card heights on the studios page
- Made the layout responsive so it scrolls naturally on mobile

### Setbacks

- Studio detail page hero used `overflow: hidden` on the outer card to clip rounded corners
- Moving scroll to the body section broke that
- Fixed with `overflow: hidden` plus a separate inner scroll container, keeping rounded corners while letting the body scroll independently

## June 30, 2026

### Changes

- Converted studio and Instagram seed files from JS to JSON
- No local database yet, so resets currently hit the live database directly
- Planning a local DB for safer test resets

## July 1–3, 2026

### Changes

- Scrapped the LLM scraper attempt for good
- Switched to hardcoded, per-studio scraper files instead
- Added the first one, for Visceral

### Setbacks

- Iteration 1: LLM pulled data and wrote the schema at once — failed, live data can't be cached, and plain text gave it nothing to build real selectors from
- Iteration 2: Cached the schema, only regenerated on failure — failed, some schedules load in an iframe or need a click first, so the LLM just saw an empty page
- Iteration 3: Added iframe detection and click-based pagination — failed, LLM had to guess pagination type and write selectors at the same time, too unreliable
- Iteration 4: Split pagination into its own field, LLM only wrote selectors — failed, LLM mistook a date picker for pagination and produced a broken schema that ran unchecked
- Iteration 5: Human sets pagination type, LLM only finds selectors — new problem, one studio's widget loads slowly, so the LLM sometimes grabbed the page before it loaded and treated an empty placeholder as the whole class list

## July 5, 2026

### Changes

- Wrote the Puzzle Box scraper
- Wrote the Indie Media scraper
- Registered both in the scraper runner
- Filtered non-class events out of Indie Media's feed

### Setbacks

- Found the classes API never filters out past dates, so stale scrapes can still show old classes on the site — not fixed yet

## July 9-13, 2026

### Changes

- Replaced the hand-written date/time parsing rules with a library instead, tried any-date-parser first
- Switched to chrono-node instead, since it reads dates and times out of messy text in one step and can guess "upcoming" dates on its own
- Removed the old backup logic for weekday-only dates, since every scraper always provides a real date now

### Setbacks

- Chrono's "assume upcoming" setting compared against the exact current moment, not just the day, so any class happening later today got bumped a full year forward once the scrape ran after noon, silently dropping it from the site
- Fixed by comparing against the start of today instead of the exact time

## July 22-23, 2026

### Changes

- Added debug/inspection flags (`DEBUG`, `SLOW_MO`, `PAUSE_ON_START`, `PAUSE_AFTER_SCRAPE`, `KEEP_BROWSER_OPEN`) to the scraper test harness for easier Puppeteer debugging
- Added `scrape:debug`, `test:scrapers:ui`, and `test:scrapers:inspect` npm scripts
- Fixed the stale-data issue from July 5 by deleting expired classes from the DB at the start of every scrape run
- Simplified the Class Schedule page: removed unnecessary `useMemo` caching (kept it only for filtering), added chrono-node for date/time parsing, dropped price-based sorting within a day

### Setbacks

- PuzzleBox's "load more" click limit was set too high (15), scraping more days than needed and generating noisy 403 errors from Wix's analytics endpoints
- Lowered the click limit to reduce excess requests
- Got confused about where `page.evaluate()` output shows up (browser console vs. terminal); resolved by learning the terminal only shows what's explicitly logged or returned back into Node

## July 24, 2026

### Changes

- Added rewrite settings to Render to redirect all routes to `index.html`.

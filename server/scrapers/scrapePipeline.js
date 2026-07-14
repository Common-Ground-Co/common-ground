// Shared scrape pipeline for production and dry-run runs.
import { scrapeVisceral } from "./implementations/visceralScraper.js";
import { scrapePuzzlebox } from "./implementations/puzzleboxScraper.js";
import { scrapeIndieMedia } from "./implementations/indieMediaScraper.js";
import { normalizeRows, shouldInclude } from "./normalize.js";

// Add a scraper here when a studio gets its own file.
export const SCRAPERS = {
  visceral: scrapeVisceral,
  puzzlebox: scrapePuzzlebox,
  indiemedia: scrapeIndieMedia,
};

export function getScrapeWindow() {
  const today = new Date();
  const cutoff = new Date(today);
  cutoff.setDate(today.getDate() + 12);
  return {
    TODAY_DATE: today.toISOString().split("T")[0],
    CUTOFF_DATE: cutoff.toISOString().split("T")[0],
  };
}

// Runs scrape, normalize, dedupe, and filter in one pass.
export async function scrapeAndProcess(page, config) {
  const { TODAY_DATE, CUTOFF_DATE } = getScrapeWindow();
  const scrape = SCRAPERS[config.key];

  const rawRows = await scrape(page, config);
  const normalized = normalizeRows(rawRows, config);
  const usable = normalized.filter((r) => r.className && r.date);

  // Drops duplicate class/date/time rows.
  const seen = new Set();
  const deduped = usable.filter((r) => {
    const k = `${r.className}|${r.date}|${r.time}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  const filtered = deduped.filter(
    (r) =>
      shouldInclude(r.className, config.allowedStyles, config.skipKeywords) &&
      r.date >= TODAY_DATE &&
      r.date < CUTOFF_DATE,
  );

  return { rawRows, normalized, usable, deduped, filtered };
}

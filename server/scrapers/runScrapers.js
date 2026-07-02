// Orchestrator: launches Puppeteer, hands each configured studio's page to
// its own scraper function (hardcoded selectors, no LLM/schema step), then
// normalizes, filters, and writes results to the DB. Usage:
//   node scrapers/runScrapers.js [studioKey]   (DRY_RUN=1 / DEBUG=1 env flags)
import puppeteer from "puppeteer";
import pool from "../config/database.js";
import studios from "./studios.config.js";
import { scrapeVisceral } from "./visceralScraper.js";
import { normalizeRows, shouldInclude } from "./normalize.js";

const DRY_RUN = process.env.DRY_RUN === "1";
const DEBUG = process.env.DEBUG === "1";

// Add an entry here the same day a studio gets its own scraper file.
const SCRAPERS = {
  visceral: scrapeVisceral,
};

const today = new Date();
const cutoff = new Date(today);
cutoff.setDate(today.getDate() + 12);
const TODAY_DATE = today.toISOString().split("T")[0];
const CUTOFF_DATE = cutoff.toISOString().split("T")[0];

async function runStudio(browser, config) {
  const scrape = SCRAPERS[config.key];
  if (!scrape) {
    console.warn(`⚠️  ${config.studioName}: no scraper implemented yet — skipping`);
    return;
  }

  console.log(`🕷️  Scraping ${config.studioName}...`);
  const page = await browser.newPage();

  try {
    const rawRows = await scrape(page, config);

    if (DEBUG) {
      console.log("  [DEBUG] Raw extracted rows:");
      rawRows.forEach((r, i) =>
        console.log(
          `    [${i}] date="${r.date}" day="${r.day}" startTime="${r.startTime}" class="${r.className}" instructor="${r.instructor}"`,
        ),
      );
    }

    const normalized = normalizeRows(rawRows, config);
    const usable = normalized.filter((r) => r.className && r.date);

    // Some studios re-list the same class across overlapping views; dedupe on
    // the identity the DB cares about.
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

    if (DEBUG) {
      console.log(
        `  [DEBUG] ${normalized.length} normalized → ${usable.length} usable → ${deduped.length} deduped → ${filtered.length} after keyword/window filter`,
      );
    }

    if (filtered.length === 0) {
      console.warn(
        `⚠️  Zero classes after filtering for ${config.studioName} — skipping DB write`,
      );
      return;
    }
    if (filtered.length > 300) {
      console.warn(
        `⚠️  ${filtered.length} classes seems too many for ${config.studioName} — skipping DB write`,
      );
      return;
    }

    if (DRY_RUN) {
      console.log(`🔍 DRY RUN — ${config.studioName}: ${filtered.length} classes`);
      filtered.forEach((r) => {
        console.log(
          `  ${r.date} ${r.time || "??"} — ${r.className}${r.instructor ? ` (${r.instructor})` : ""}`,
        );
      });
      return;
    }

    await pool.query("DELETE FROM classes WHERE studio_id = $1", [
      config.studioId,
    ]);

    let inserted = 0;
    let skipped = 0;
    for (const r of filtered) {
      if (!r.time) {
        skipped++;
        continue;
      }
      await pool.query(
        `INSERT INTO classes (studio_id, name, instructor, style, skill_level, day_of_week, class_date, start_time, booking_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          config.studioId,
          r.className,
          r.instructor,
          r.style,
          r.skillLevel,
          r.dayOfWeek,
          r.date,
          r.time,
          r.bookingUrl,
        ],
      );
      inserted++;
    }

    console.log(
      `✅ ${config.studioName}: ${inserted} inserted, ${skipped} skipped`,
    );
  } catch (err) {
    console.warn(`⚠️  Scrape failed for ${config.studioName}: ${err.message}`);
  } finally {
    await page.close();
  }
}

const run = async () => {
  const targetKey = process.argv[2]?.toLowerCase();

  const toRun = targetKey
    ? studios.filter((s) => s.key === targetKey)
    : studios;

  if (targetKey && toRun.length === 0) {
    const keys = studios.map((s) => s.key).join(", ");
    console.error(`⚠️  Unknown scraper "${targetKey}". Available: ${keys}`);
    process.exit(1);
  }

  console.log(
    `🗓️  Scraping window: ${TODAY_DATE} → ${CUTOFF_DATE}${DRY_RUN ? " (dry run)" : ""}`,
  );

  const browser = await puppeteer.launch({ headless: true });
  try {
    for (const studio of toRun) {
      await runStudio(browser, studio);
    }
  } finally {
    await browser.close();
    await pool.end();
    console.log("🌱 Done");
  }
};

run();

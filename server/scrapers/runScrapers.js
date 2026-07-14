// Main scraper runner for production DB syncs.

import puppeteer from "puppeteer";
import pool from "../config/database.js";
import studios from "./studios.config.js";
import {
  SCRAPERS,
  scrapeAndProcess,
  getScrapeWindow,
} from "./scrapePipeline.js";

const { TODAY_DATE, CUTOFF_DATE } = getScrapeWindow();

async function runStudio(browser, config) {
  if (!SCRAPERS[config.key]) {
    console.warn(
      `⚠️  ${config.studioName}: no scraper implemented yet — skipping`,
    );
    return;
  }

  console.log(`🕷️  Scraping ${config.studioName}...`);
  const page = await browser.newPage();

  try {
    const { filtered } = await scrapeAndProcess(page, config);

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
    // Skip DB writes when the scrape looks broken or oversized.

    await pool.query("DELETE FROM classes WHERE studio_id = $1", [
      config.studioId,
    ]);
    // Clear old rows before inserting the refreshed schedule.

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
  // Pass a key to run one scraper; otherwise run them all.

  if (targetKey && toRun.length === 0) {
    const keys = studios.map((s) => s.key).join(", ");
    console.error(`⚠️  Unknown scraper "${targetKey}". Available: ${keys}`);
    process.exit(1);
  }

  console.log(`🗓️  Scraping window: ${TODAY_DATE} → ${CUTOFF_DATE}`);

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

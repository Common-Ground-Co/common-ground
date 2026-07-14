// Dry-run harness for the scraper pipeline.
// Usage: node scrapers/tests/testScrapers.js [studioKey] (DEBUG=1 for raw-row dump)
import puppeteer from "puppeteer";
import studios from "../studios.config.js";
import {
  SCRAPERS,
  scrapeAndProcess,
  getScrapeWindow,
} from "../scrapePipeline.js";

const DEBUG = process.env.DEBUG === "1";
const { TODAY_DATE, CUTOFF_DATE } = getScrapeWindow();

async function testStudio(browser, config) {
  if (!SCRAPERS[config.key]) {
    console.warn(
      `⚠️  ${config.studioName}: no scraper implemented yet — skipping`,
    );
    return;
  }

  console.log(`🕷️  Test-scraping ${config.studioName}...`);
  const page = await browser.newPage();

  try {
    const { rawRows, normalized, usable, deduped, filtered } =
      await scrapeAndProcess(page, config);

    if (DEBUG) {
      console.log("  [DEBUG] Raw extracted rows:");
      rawRows.forEach((r, i) =>
        console.log(
          `    [${i}] date="${r.date}" day="${r.day}" startTime="${r.startTime}" class="${r.className}" instructor="${r.instructor}"`,
        ),
      );
      console.log(
        `  [DEBUG] ${normalized.length} normalized → ${usable.length} usable → ${deduped.length} deduped → ${filtered.length} after keyword/window filter`,
      );
    }

    if (filtered.length === 0) {
      console.warn(`⚠️  Zero classes after filtering for ${config.studioName}`);
      return;
    }
    if (filtered.length > 300) {
      console.warn(
        `⚠️  ${filtered.length} classes seems too many for ${config.studioName}`,
      );
    }

    console.log(
      `🔍 DRY RUN — ${config.studioName}: ${filtered.length} classes`,
    );
    filtered.forEach((r) => {
      console.log(
        `  ${r.date} ${r.time || "??"} — ${r.className}${r.instructor ? ` (${r.instructor})` : ""}`,
      );
    });
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

  console.log(`🗓️  Scraping window: ${TODAY_DATE} → ${CUTOFF_DATE} (dry run)`);

  const browser = await puppeteer.launch({ headless: true });
  try {
    for (const studio of toRun) {
      await testStudio(browser, studio);
    }
  } finally {
    await browser.close();
    console.log("🌱 Done");
  }
};

run();

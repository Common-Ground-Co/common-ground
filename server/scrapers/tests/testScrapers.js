// Dry-run harness for the scraper pipeline.
// Usage: npm run test:scrapers:inspect -- puzzlebox
import puppeteer from "puppeteer";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import studios from "../studios.config.js";
import {
  SCRAPERS,
  scrapeAndProcess,
  getScrapeWindow,
} from "../scrapePipeline.js";

const DEBUG = process.env.DEBUG === "1";
const SHOW_BROWSER = process.env.SHOW_BROWSER === "1";
const PAUSE_ON_START = process.env.PAUSE_ON_START === "1";
const KEEP_BROWSER_OPEN = process.env.KEEP_BROWSER_OPEN === "1";
const PAUSE_BEFORE_SCRAPE = process.env.PAUSE_BEFORE_SCRAPE === "1";
const PAUSE_AFTER_SCRAPE = process.env.PAUSE_AFTER_SCRAPE === "1";

function getEnvNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

// In visible browser mode, default to slower actions unless explicitly overridden.
const SLOW_MO = getEnvNumber(process.env.SLOW_MO, SHOW_BROWSER ? 400 : 0);
const { TODAY_DATE, CUTOFF_DATE } = getScrapeWindow();

async function waitForEnter(message) {
  const prompt = readline.createInterface({ input, output });
  await prompt.question(`${message}\nPress Enter to continue...`);
  prompt.close();
}

async function testStudio(browser, config) {
  if (!SCRAPERS[config.key]) {
    console.warn(
      `⚠️  ${config.studioName}: no scraper implemented yet — skipping`,
    );
    return;
  }

  console.log(`🕷️  Test-scraping ${config.studioName}...`);
  const page = await browser.newPage();
  page.on("console", (message) => {
    const text = message.text();
    console.log(`[${config.key}] [page:${message.type()}] ${text}`);
  });
  page.on("pageerror", (error) => {
    console.warn(`[${config.key}] [pageerror] ${error.message}`);
  });

  if (PAUSE_BEFORE_SCRAPE) {
    await waitForEnter(
      `⏸️  ${config.studioName}: page is open. Inspect now before scraping starts.`,
    );
  }

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
    if (PAUSE_AFTER_SCRAPE) {
      await waitForEnter(
        `⏸️  ${config.studioName}: scrape finished. Inspect DevTools/console now before tab closes.`,
      );
    }

    if (!KEEP_BROWSER_OPEN) {
      await page.close();
    } else {
      console.log(`🧷 Keeping tab open for ${config.studioName}`);
    }
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
  if (SHOW_BROWSER) {
    console.log(
      "👀 Browser mode enabled: Puppeteer will open a visible window with DevTools.",
    );
  }

  const browser = await puppeteer.launch({
    headless: !SHOW_BROWSER,
    devtools: SHOW_BROWSER,
    defaultViewport: SHOW_BROWSER ? null : undefined,
    slowMo: SLOW_MO || undefined,
    dumpio: SHOW_BROWSER,
  });
  if (PAUSE_ON_START) {
    await waitForEnter(
      "🧪 Pause mode enabled. The browser is open so you can inspect it before scraping starts.",
    );
  }
  try {
    for (const studio of toRun) {
      await testStudio(browser, studio);
    }
  } finally {
    if (!KEEP_BROWSER_OPEN) {
      await browser.close();
    }
    console.log("🌱 Done");
  }
};

run();

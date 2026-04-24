import pool from "../config/database.js";
import {
  scrapePuzzleBox,
  parseSkillLevel as parsePuzzleLevel,
  parseDate as parsePuzzleDate,
  parseTime as parsePuzzleTime,
  STUDIO_ID as PUZZLE_ID,
} from "./puzzlebox.js";
import {
  scrapeVisceral,
  parseSkillLevel as parseVisceralLevel,
  parseDate as parseVisceralDate,
  parseTime as parseVisceralTime,
  shouldIncludeClass,
  STUDIO_ID as VISCERAL_ID,
} from "./visceral.js";

// Set DRY_RUN=1 to test scraping without writing to the database.
const DRY_RUN = process.env.DRY_RUN === "1";

// Keep classes from today through the next 7 days.
const today = new Date();
const cutoff = new Date(today);
cutoff.setDate(today.getDate() + 8);
const CUTOFF_DATE = cutoff.toISOString().split("T")[0];

// Turn "YYYY-MM-DD" into a weekday name like "Monday".
function getDayOfWeekFromIsoDate(isoDate) {
  const [year, month, day] = String(isoDate).split("-").map(Number);
  const utcDate = new Date(Date.UTC(year, month - 1, day));
  return utcDate.toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: "UTC",
  });
}

// Scrape, clean, and save Puzzle Box classes.
const runPuzzleBox = async () => {
  console.log("🕷️ Scraping Puzzle Box...");
  const { classes } = await scrapePuzzleBox();
  console.log(`📦 Scraped ${classes.length} raw classes`);

  if (!DRY_RUN) {
    // Remove old Puzzle Box classes so we replace with fresh results.
    await pool.query("DELETE FROM classes WHERE studio_id = $1", [PUZZLE_ID]);
  }

  let inserted = 0;
  let skipped = 0;

  for (const c of classes) {
    const classDate = parsePuzzleDate(c.dateText);
    const startTime = parsePuzzleTime(c.timeRaw);
    const skillLevel = parsePuzzleLevel(c.className);

    if (!classDate || !startTime || !c.className) {
      // Skip if key values are missing.
      skipped++;
      continue;
    }
    if (classDate >= CUTOFF_DATE) {
      // Skip classes outside our date window.
      skipped++;
      continue;
    }

    const dayOfWeek = getDayOfWeekFromIsoDate(classDate);

    if (!DRY_RUN) {
      // Save one class row.
      await pool.query(
        `INSERT INTO classes (studio_id, name, skill_level, day_of_week, class_date, start_time)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [PUZZLE_ID, c.className, skillLevel, dayOfWeek, classDate, startTime],
      );
    }
    inserted++;
  }

  console.log(`✅ Puzzle Box: ${inserted} inserted, ${skipped} skipped`);
};

// Scrape, clean, and save Visceral classes.
const runVisceral = async () => {
  console.log("🕷️ Scraping Visceral...");
  const { classes } = await scrapeVisceral();
  console.log(`📦 Scraped ${classes.length} raw classes`);

  if (!DRY_RUN) {
    // Remove old Visceral classes so we replace with fresh results.
    await pool.query("DELETE FROM classes WHERE studio_id = $1", [VISCERAL_ID]);
  }

  let inserted = 0;
  let skipped = 0;

  for (const c of classes) {
    if (!shouldIncludeClass(c.className)) {
      // Skip non-target classes (kids, virtual, etc.).
      skipped++;
      continue;
    }

    const classDate = parseVisceralDate(c.startDatetime);
    const startTime = parseVisceralTime(c.startDatetime);
    const skillLevel = parseVisceralLevel(c.className);

    if (!classDate || !startTime || !c.className) {
      // Skip if key values are missing.
      skipped++;
      continue;
    }
    if (classDate >= CUTOFF_DATE) {
      // Skip classes outside our date window.
      skipped++;
      continue;
    }

    const dayOfWeek = getDayOfWeekFromIsoDate(classDate);

    if (!DRY_RUN) {
      // Save one class row.
      await pool.query(
        `INSERT INTO classes (studio_id, name, skill_level, day_of_week, class_date, start_time)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [VISCERAL_ID, c.className, skillLevel, dayOfWeek, classDate, startTime],
      );
    }
    inserted++;
  }

  console.log(`✅ Visceral: ${inserted} inserted, ${skipped} skipped`);
};

// Main runner: executes both scrapers and closes DB connection.
const run = async () => {
  console.log(
    `🗓️ Scraping window: today through ${CUTOFF_DATE}${DRY_RUN ? " (dry run)" : ""}`,
  );
  try {
    await runPuzzleBox();
    await runVisceral();
  } catch (err) {
    console.error("⚠️ Scrape failed:", err);
    process.exit(1);
  } finally {
    // Always close database connection at the end.
    await pool.end();
    console.log("🌱 Scrape complete");
  }
};

run();

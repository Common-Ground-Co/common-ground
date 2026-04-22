// server/scrapers/runScrapers.js

// Database connection and all the helper functions from the Puzzle Box scraper file
import pool from "../config/database.js";
import {
  scrapePuzzleBox,
  parseSkillLevel,
  parseDate,
  parseTime,
  STUDIO_ID,
} from "./puzzlebox.js";

const DRY_RUN = process.env.DRY_RUN === "1";

function getDayOfWeekFromIsoDate(isoDate) {
  const [year, month, day] = String(isoDate).split("-").map(Number);
  const utcDate = new Date(Date.UTC(year, month - 1, day));
  return utcDate.toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: "UTC",
  });
}

const run = async () => {
  console.log(`🕷️ Starting Puzzle Box scrape${DRY_RUN ? " (dry run)" : ""}...`);

  // Launch the browser, visit the Puzzle Box schedule page, and pull all the raw class data
  const { classes } = await scrapePuzzleBox();

  console.log(`📦 Scraped ${classes.length} raw classes`);

  // Wipe out all existing Puzzle Box classes in the database so we're not
  // doubling up on classes from a previous scrape run
  if (!DRY_RUN) {
    await pool.query("DELETE FROM classes WHERE studio_id = $1", [STUDIO_ID]);
  }

  // Keep count of what gets saved and what gets skipped
  let inserted = 0;
  let skipped = 0;
  const previewRows = [];

  // Loop through every class the scraper found
  for (const c of classes) {
    // Convert the raw text values into the formats the database expects
    // e.g. "April 22" → "2026-04-22", "7:15 pm" → "19:15:00", "Beg/Int" → "Beginner/Intermediate"
    const classDate = parseDate(c.dateText);
    const startTime = parseTime(c.timeRaw);
    const skillLevel = parseSkillLevel(c.className);

    // If any essential data is missing, skip this class instead of crashing
    if (!classDate || !startTime || !c.className) {
      skipped++;
      continue;
    }

    // Compute weekday from the date string itself so timezone offsets cannot shift the day.
    const dayOfWeek = getDayOfWeekFromIsoDate(classDate);

    const rowToSave = {
      studio_id: STUDIO_ID,
      name: c.className,
      skill_level: skillLevel,
      day_of_week: dayOfWeek,
      class_date: classDate,
      start_time: startTime,
    };

    if (DRY_RUN) {
      if (previewRows.length < 10) {
        previewRows.push(rowToSave);
      }
    } else {
      // Save the class to the database
      await pool.query(
        `INSERT INTO classes (studio_id, name, skill_level, day_of_week, class_date, start_time)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          rowToSave.studio_id,
          rowToSave.name,
          rowToSave.skill_level,
          rowToSave.day_of_week,
          rowToSave.class_date,
          rowToSave.start_time,
        ],
      );
    }

    inserted++;
  }

  if (DRY_RUN) {
    console.log(
      `🧪 Dry run complete: ${inserted} classes valid, ${skipped} skipped`,
    );
    if (previewRows.length > 0) {
      console.log("Preview of parsed rows (up to 10):");
      console.table(previewRows);
    }
  } else {
    console.log(
      `✅ Puzzle Box: ${inserted} classes inserted, ${skipped} skipped`,
    );
  }

  // Close the database connection now that we're done
  await pool.end();
};

// Kick everything off
run();

import pool from "../config/database.js";
import studios from "./studios.config.js";
import { loadClasses } from "./pageLoader.js";
import { parseSkillLevel, parseGenre, shouldInclude } from "./sharedParsers.js";

const DRY_RUN = process.env.DRY_RUN === "1";
const DEBUG = process.env.DEBUG === "1";

const today = new Date();
const cutoff = new Date(today);
cutoff.setDate(today.getDate() + 12);
const TODAY_DATE = today.toISOString().split("T")[0];
const CUTOFF_DATE = cutoff.toISOString().split("T")[0];

function getDayOfWeekFromIsoDate(isoDate) {
  const [year, month, day] = String(isoDate).split("-").map(Number);
  const utcDate = new Date(Date.UTC(year, month - 1, day));
  return utcDate.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" });
}

function normalizeTime(t) {
  if (!t) return null;
  const parts = t.split(":");
  if (parts.length === 2) return `${parts[0].padStart(2, "0")}:${parts[1]}:00`;
  if (parts.length === 3) return `${parts[0].padStart(2, "0")}:${parts[1]}:${parts[2]}`;
  return null;
}

async function runStudio(config) {
  console.log(`🕷️  Scraping ${config.studioName}...`);

  let classes;
  try {
    classes = await loadClasses(config);
  } catch (err) {
    console.warn(`⚠️  Page load failed for ${config.studioName}: ${err.message}`);
    return;
  }

  console.log(`📦 ${config.studioName}: ${classes.length} raw classes`);

  if (DEBUG) {
    console.log("  [DEBUG] Raw classes:");
    classes.forEach((c, i) =>
      console.log(`    [${i}] date="${c.date}" time="${c.time}" class="${c.className}" instructor="${c.instructor}"`),
    );
  }

  const filtered = classes.filter((c) =>
    c.className && shouldInclude(c.className, config.allowedStyles, config.skipKeywords),
  );

  if (DEBUG) {
    console.log(`  [DEBUG] After keyword/allowlist filter: ${filtered.length} classes`);
  }

  if (filtered.length === 0) {
    console.warn(`⚠️  Zero classes after filtering for ${config.studioName} — skipping DB write`);
    return;
  }
  if (filtered.length > 300) {
    console.warn(`⚠️  ${filtered.length} classes seems too many for ${config.studioName} — skipping DB write`);
    return;
  }

  const valid = filtered.filter((c) => {
    if (!c.date) {
      if (DEBUG) console.log(`  [DEBUG] Dropping "${c.className}" — no date`);
      return false;
    }
    const inWindow = c.date >= TODAY_DATE && c.date < CUTOFF_DATE;
    if (!inWindow && DEBUG) {
      console.log(`  [DEBUG] Dropping "${c.className}" — date "${c.date}" outside window [${TODAY_DATE}, ${CUTOFF_DATE})`);
    }
    return inWindow;
  });

  if (valid.length === 0) {
    console.warn(`⚠️  No valid-dated classes for ${config.studioName} — skipping DB write`);
    return;
  }

  if (DRY_RUN) {
    console.log(`🔍 DRY RUN — ${config.studioName}: ${valid.length} classes`);
    valid.forEach((c) => {
      console.log(`  ${c.date} ${c.time || "??"} — ${c.className}${c.instructor ? ` (${c.instructor})` : ""}`);
    });
    return;
  }

  await pool.query("DELETE FROM classes WHERE studio_id = $1", [config.studioId]);

  let inserted = 0;
  let skipped = 0;

  for (const c of valid) {
    const startTime = normalizeTime(c.time);
    if (!startTime) { skipped++; continue; }

    const style = parseGenre(c.className);
    const skillLevel = parseSkillLevel(c.className);
    const dayOfWeek = getDayOfWeekFromIsoDate(c.date);

    await pool.query(
      `INSERT INTO classes (studio_id, name, instructor, style, skill_level, day_of_week, class_date, start_time, booking_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        config.studioId,
        c.className,
        c.instructor || null,
        style,
        skillLevel,
        dayOfWeek,
        c.date,
        startTime,
        c.bookingUrl || null,
      ],
    );
    inserted++;
  }

  console.log(`✅ ${config.studioName}: ${inserted} inserted, ${skipped} skipped`);
}

const run = async () => {
  const target = process.argv[2]?.toLowerCase();

  const toRun = target
    ? studios.filter((s) => s.key === target)
    : studios;

  if (target && toRun.length === 0) {
    const keys = studios.map((s) => s.key).join(", ");
    console.error(`⚠️  Unknown scraper "${target}". Available: ${keys}`);
    process.exit(1);
  }

  console.log(`🗓️  Scraping window: ${TODAY_DATE} → ${CUTOFF_DATE}${DRY_RUN ? " (dry run)" : ""}`);

  try {
    for (const studio of toRun) {
      await runStudio(studio);
    }
  } finally {
    await pool.end();
    console.log("🌱 Done");
  }
};

run();

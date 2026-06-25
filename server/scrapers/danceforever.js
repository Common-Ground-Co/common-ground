import puppeteer from "puppeteer";

const SCHEDULE_URL = "https://www.dance-forever.com/schedule";
const SKIP_KEYWORDS = [/cardio/i];

export function shouldIncludeClass(name) {
  return !SKIP_KEYWORDS.some((re) => re.test(name));
}

export function parseSkillLevel(text) {
  const lower = text.toLowerCase();
  if (/\bbeg[/\-]int\b|\bint[/\-]beg\b/.test(lower)) return "Beginner/Intermediate";
  if (/\bint[/\-]adv\b|\badv[/\-]int\b/.test(lower)) return "Intermediate/Advanced";
  if (/\bbeg(inner)?\b/.test(lower)) return "Beginner";
  if (/\bint(ermediate)?\b/.test(lower)) return "Intermediate";
  if (/\badv(anced)?\b/.test(lower)) return "Advanced";
  return "Open Level";
}

// Parse the #selected_date text: "Thursday, June 25, 2026" → "2026-06-25".
export function parseDateFromSelected(text) {
  if (!text) return null;
  const match = text.match(/([A-Z][a-z]+),\s+([A-Z][a-z]+)\s+(\d{1,2}),\s+(\d{4})/);
  if (!match) return null;
  const date = new Date(`${match[2]} ${match[3]}, ${match[4]}`);
  if (isNaN(date)) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

// Parse "7:00 PM" → "19:00:00".
export function parseTimeFromText(text) {
  const match = text.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return null;
  let hours = parseInt(match[1]);
  const minutes = match[2];
  const period = match[3].toLowerCase();
  if (period === "pm" && hours !== 12) hours += 12;
  if (period === "am" && hours === 12) hours = 0;
  return `${String(hours).padStart(2, "0")}:${minutes}:00`;
}

// Scrape classes from the Ribbon weekly schedule widget.
// Clicks through each non-past day in the current week, then advances
// to the next week and repeats — covering 2 weeks total.
export const scrapeDanceForever = async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(SCHEDULE_URL, { waitUntil: "networkidle2", timeout: 60000 });

  // Wait for the Ribbon widget to inject its HTML.
  await page.waitForSelector("#ribbon-schedule", { timeout: 30000 });
  // Extra buffer for the widget's JS to fully render the schedule.
  await new Promise((r) => setTimeout(r, 2000));

  const classes = [];

  for (let week = 0; week < 2; week++) {
    // Collect IDs of all days in this week that aren't in the past.
    const dayIds = await page.evaluate(() =>
      Array.from(document.querySelectorAll(".week_day:not(.in_past)")).map(
        (el) => el.id,
      ),
    );

    for (const dayId of dayIds) {
      await page.click(`[id="${dayId}"]`);
      await new Promise((r) => setTimeout(r, 1200));

      // Read the authoritative date from today_container after the click.
      const selectedDateText = await page.$eval(
        "#selected_date",
        (el) => el.textContent?.trim() || "",
      );

      const dayClasses = await page.evaluate((dateText, id) => {
        const results = [];
        document.querySelectorAll(`li.schedule_item[data-id="${id}"]`).forEach((li) => {
          const className = (
            li.querySelector(".event_title > span:first-child")?.textContent?.trim() || ""
          ).replace(/\s*\(.*?\)\s*/g, "").trim();
          const instructor =
            li.querySelector(".teacher_name")?.textContent?.trim() || "";
          const timeText =
            li.querySelector(".class_time")?.textContent?.trim() || "";
          const bookingUrl =
            li.querySelector(".sign_up_button")?.getAttribute("href") || null;

          if (className) {
            results.push({ className, instructor, timeText, selectedDateText: dateText, bookingUrl });
          }
        });
        return results;
      }, selectedDateText, dayId);

      classes.push(...dayClasses);
    }

    // Advance to next week before the second iteration.
    if (week === 0) {
      const nextWeekBtn = await page.$(".nextButton button");
      if (!nextWeekBtn) break;
      await nextWeekBtn.click();
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  await browser.close();
  return { classes };
};

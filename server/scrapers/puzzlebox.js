// server/scrapers/puzzlebox.js
import puppeteer from "puppeteer";

const STUDIO_ID = 2; // Puzzle Box's id in your studios table

const parseSkillLevel = (className) => {
  const lower = className.toLowerCase();
  if (/\bbeg\/int\b|\bint\/beg\b/.test(lower)) return "Beginner/Intermediate";
  if (/\bint\/adv\b|\badv\/int\b/.test(lower)) return "Intermediate/Advanced";
  if (/\bbeg(inner)?\b/.test(lower)) return "Beginner";
  if (/\bint(ermediate)?\b/.test(lower)) return "Intermediate";
  if (/\badv(anced)?\b/.test(lower)) return "Advanced";
  if (/\bopen level\b|\ball levels\b/.test(lower)) return "All Levels";
  return null;
};

const parseDate = (dateText, dayText) => {
  // dateText looks like "April 22", "May 2" etc.
  const currentYear = new Date().getFullYear();
  const date = new Date(`${dateText} ${currentYear}`);
  if (isNaN(date)) return null;
  return date.toISOString().split("T")[0]; // returns "2026-04-22"
};

const parseTime = (timeText) => {
  // timeText looks like "7:15 pm", "8:30 pm"
  const match = timeText.match(/(\d+):(\d+)\s*(am|pm)/i);
  if (!match) return null;
  let [, hours, minutes, period] = match;
  hours = parseInt(hours);
  if (period.toLowerCase() === "pm" && hours !== 12) hours += 12;
  if (period.toLowerCase() === "am" && hours === 12) hours = 0;
  return `${String(hours).padStart(2, "0")}:${minutes}:00`;
};

const scrapePuzzleBox = async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto("https://www.thepuzzleboxdancestudio.com/book-by-calendar", {
    waitUntil: "networkidle2",
    timeout: 60000,
  });

  // Wait for schedule to load
  await page.waitForSelector('[data-hook="daily-agenda-slot"]', {
    timeout: 30000,
  });

  // Click "Load more classes" until it disappears
  while (true) {
    const loadMoreBtn = await page.$(
      '[data-hook="daily-agenda-load-more-button"]',
    );
    if (!loadMoreBtn) break;
    const isDisabled = await page.evaluate(
      (btn) => btn.getAttribute("aria-disabled") === "true",
      loadMoreBtn,
    );
    if (isDisabled) break;
    await loadMoreBtn.click();
    await new Promise((r) => setTimeout(r, 1500));
  }

  // Extract all class data
  const classes = await page.evaluate(() => {
    const results = [];
    const days = document.querySelectorAll('[data-hook="daily-agenda-day"]');

    days.forEach((day) => {
      const dateEl = day.querySelector('[data-hook="daily-agenda-day-date"]');
      const dayNameEl = day.querySelector(".sdLf6MF");
      const dateText = dateEl?.textContent?.trim() || "";
      const dayText = dayNameEl?.textContent?.trim() || "";

      const slots = day.querySelectorAll('[data-hook="daily-agenda-slot"]');
      slots.forEach((slot) => {
        const nameEl = slot.querySelector(".s_KroQ2");
        const timeEl = slot.querySelector(".ssaqcAw");

        const className = nameEl?.textContent?.trim() || "";
        const timeRaw = timeEl?.childNodes[0]?.textContent?.trim() || "";

        results.push({ className, timeRaw, dateText, dayText });
      });
    });

    return results;
  });

  await browser.close();
  return { classes };
};

export { scrapePuzzleBox, parseSkillLevel, parseDate, parseTime, STUDIO_ID };

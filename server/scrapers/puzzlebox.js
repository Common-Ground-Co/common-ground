// server/scrapers/puzzlebox.js
import puppeteer from "puppeteer";

// This is the studio id used when saving Puzzle Box classes.
const STUDIO_ID = 2;

// Read a class title and convert it to one of our standard skill levels.
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

// Convert text like "April 22" into "YYYY-MM-DD".
const parseDate = (dateText) => {
  const currentYear = new Date().getFullYear();
  const date = new Date(`${dateText} ${currentYear}`);
  if (isNaN(date)) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Convert time text like "7:15 pm" into 24-hour format used by the DB.
const parseTime = (timeText) => {
  const match = timeText.match(/(\d+):(\d+)\s*(am|pm)/i);
  if (!match) return null;
  let [, hours, minutes, period] = match;
  hours = parseInt(hours);
  if (period.toLowerCase() === "pm" && hours !== 12) hours += 12;
  if (period.toLowerCase() === "am" && hours === 12) hours = 0;
  return `${String(hours).padStart(2, "0")}:${minutes}:00`;
};

// Open Puzzle Box schedule page and collect all visible classes.
const scrapePuzzleBox = async () => {
  // Start a headless browser (no visible window).
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto("https://www.thepuzzleboxdancestudio.com/book-by-calendar", {
    waitUntil: "networkidle2",
    timeout: 60000,
  });

  // Wait until at least one class slot is loaded on the page.
  await page.waitForSelector('[data-hook="daily-agenda-slot"]', {
    timeout: 30000,
  });

  // Click "Load more" up to 10 times so we collect more upcoming classes.
  let attempts = 0;
  while (attempts < 10) {
    const loadMoreBtn = await page.$(
      '[data-hook="daily-agenda-load-more-button"]',
    );
    if (!loadMoreBtn) break;
    try {
      await loadMoreBtn.click();
      await new Promise((r) => setTimeout(r, 1500));
      attempts++;
    } catch {
      break;
    }
  }

  // Pull class fields from the page into plain JS objects.
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
  // Return every class we found.
  return { classes };
};

export { scrapePuzzleBox, parseSkillLevel, parseDate, parseTime, STUDIO_ID };

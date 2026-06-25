import puppeteer from "puppeteer";

// This is the studio id used when saving Indie Media classes.
const STUDIO_ID = 4;

// Map class title keywords to a canonical dance genre.
const parseGenre = (text) => {
  const lower = text.toLowerCase();
  if (/afro(beat)?s?/.test(lower)) return "Afrobeats";
  if (/dancehall/.test(lower)) return "Dancehall";
  if (/reggaeton/.test(lower)) return "Reggaeton";
  if (/hip[\s-]?hop/.test(lower)) return "Hip-Hop";
  if (/heels/.test(lower)) return "Heels";
  if (/vogue|voguing/.test(lower)) return "Vogue";
  if (/waack|wackin/.test(lower)) return "Waacking";
  if (/jazz[\s-]funk/.test(lower)) return "Jazz Funk";
  if (/jazz/.test(lower)) return "Jazz";
  if (/contemporary/.test(lower)) return "Contemporary";
  if (/ballet/.test(lower)) return "Ballet";
  if (/bachata/.test(lower)) return "Bachata";
  if (/salsa/.test(lower)) return "Salsa";
  if (/k[\s-]?pop/.test(lower)) return "K-Pop";
  if (/open[\s-]style/.test(lower)) return "Open Style";
  return null;
};

// Read class title and return a standard skill level.
// Per spec: no level found → "Open Level".
const parseSkillLevel = (text) => {
  const lower = text.toLowerCase();
  if (/\bbeg[/\-]int\b|\bint[/\-]beg\b/.test(lower)) return "Beginner/Intermediate";
  if (/\bint[/\-]adv\b|\badv[/\-]int\b/.test(lower)) return "Intermediate/Advanced";
  if (/\bbeg(inner)?\b/.test(lower)) return "Beginner";
  if (/\bint(ermediate)?\b/.test(lower)) return "Intermediate";
  if (/\badv(anced)?\b/.test(lower)) return "Advanced";
  return "Open Level";
};

// Parse a date from card text like "May 14, 2026, 8:15 PM – 9:30 PM".
// Takes the first date mentioned (the start date).
const parseDateFromText = (text) => {
  const match = text.match(/([A-Z][a-z]+)\s+(\d{1,2}),\s+(\d{4})/);
  if (!match) return null;
  const date = new Date(`${match[1]} ${match[2]}, ${match[3]}`);
  if (isNaN(date)) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Parse the start time from card text like "May 14, 2026, 8:15 PM – 9:30 PM".
// Takes the first time mentioned.
const parseTimeFromText = (text) => {
  const match = text.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return null;
  let hours = parseInt(match[1]);
  const minutes = match[2];
  const period = match[3].toLowerCase();
  if (period === "pm" && hours !== 12) hours += 12;
  if (period === "am" && hours === 12) hours = 0;
  return `${String(hours).padStart(2, "0")}:${minutes}:00`;
};

// The Sign Up button href is already a full URL — return it directly.
// Handles relative paths just in case.
const resolveBookingUrl = (rawHref) => {
  if (!rawHref) return null;
  if (rawHref.startsWith("http")) return rawHref;
  if (rawHref.startsWith("/"))
    return `https://www.indiemediastudio.com${rawHref}`;
  return null;
};

// Open Indie Media homepage and collect all Wix Events class cards.
const scrapeIndieMedia = async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto("https://www.indiemediastudio.com/", {
    waitUntil: "networkidle2",
    timeout: 60000,
  });

  // Wait for event cards to appear in the DOM.
  await page.waitForSelector('[data-hook="events-card"]', {
    timeout: 30000,
  });

  // Click "Load more" up to 10 times to collect more upcoming classes.
  let attempts = 0;
  while (attempts < 10) {
    const loadMoreBtn = await page.$('[data-hook="load-more-button"]');
    if (!loadMoreBtn) break;
    try {
      await loadMoreBtn.click();
      await new Promise((r) => setTimeout(r, 1500));
      attempts++;
    } catch {
      break;
    }
  }

  // Extract title, date/time text, and Sign Up URL from each card.
  const classes = await page.evaluate(() => {
    const results = [];
    document.querySelectorAll('[data-hook="events-card"]').forEach((card) => {
      const titleEl = card.querySelector('[data-hook="title"]');
      const dateEl = card.querySelector('[data-hook="date"]');
      const rsvpEl = card.querySelector('[data-hook="ev-rsvp-button"]');

      const rawTitle = titleEl?.textContent?.trim() || "";
      const hyphenIdx = rawTitle.indexOf(" - ");
      // No hyphen means no instructor — these are non-dance listings, skip them.
      if (hyphenIdx === -1) return;

      const instructor = rawTitle.slice(0, hyphenIdx).trim();
      // Strip the day hint in parentheses, e.g. "(Tuesday)", from the class name portion.
      const className = rawTitle
        .slice(hyphenIdx + 3)
        .replace(/\s*\(.*?\)\s*/g, "")
        .trim();

      const dateTimeText = dateEl?.textContent?.trim() || "";
      const bookingHref =
        rsvpEl?.getAttribute("href") ||
        titleEl?.getAttribute("href") ||
        null;

      if (className) results.push({ className, instructor, dateTimeText, bookingHref });
    });
    return results;
  });

  await browser.close();
  return { classes };
};

export {
  scrapeIndieMedia,
  parseSkillLevel,
  parseGenre,
  parseDateFromText,
  parseTimeFromText,
  resolveBookingUrl,
  STUDIO_ID,
};

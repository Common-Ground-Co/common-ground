import puppeteer from "puppeteer";

// This is the studio id used when saving Visceral classes.
const STUDIO_ID = 1;

// Only keep classes that match these dance styles.
const ALLOWED_STYLES = [
  "hip hop",
  "hip-hop",
  "open",
  "k-pop",
  "kpop",
  "heels",
  "wacking",
  "waacking",
  "vogue",
  "vouge",
  "jazz",
  "contemporary",
  "ballet",
  "tap",
  "modern",
];

// Skip classes with these keywords.
const SKIP_KEYWORDS = [
  "youth",
  "kids",
  "kid",
  "children",
  "closed",
  "virtual",
  "pilates",
  "bemoved",
];

// Return true only for classes we want in the directory.
const shouldIncludeClass = (className) => {
  const lower = className.toLowerCase();
  if (SKIP_KEYWORDS.some((kw) => lower.includes(kw))) return false;
  return ALLOWED_STYLES.some((style) => lower.includes(style));
};

// Convert class title into one of our standard skill levels.
const parseSkillLevel = (className) => {
  const lower = className.toLowerCase();
  if (/\bbeg\/int\b|\bint\/beg\b/.test(lower)) return "Beginner/Intermediate";
  if (/\bint\/adv\b|\badv\/int\b/.test(lower)) return "Intermediate/Advanced";
  if (/\bbeg(inner)?\b/.test(lower)) return "Beginner";
  if (/\bint(ermediate)?\b/.test(lower)) return "Intermediate";
  if (/\badv(anced)?\b|\bpro\b/.test(lower)) return "Advanced";
  return "All Levels";
};

// Mindbody provides ISO datetime. Keep only the date part.
const parseDate = (isoDatetime) => {
  return isoDatetime.split("T")[0];
};

// Mindbody provides ISO datetime. Keep only the time part for DB storage.
const parseTime = (isoDatetime) => {
  const timePart = isoDatetime.split("T")[1];
  if (!timePart) return null;
  return `${timePart}:00`;
};

// Open Visceral schedule page and collect all class data from the embedded widget.
const scrapeVisceral = async () => {
  // Start a headless browser (no visible window).
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto("https://www.visceraldance.com/classschedule", {
    waitUntil: "networkidle2",
    timeout: 60000,
  });

  // Give Wix time to add the embedded iframe to the page.
  await new Promise((resolve) => setTimeout(resolve, 8000));

  // Find the iframe that contains the schedule widget.
  const frames = page.frames();
  const widgetFrame = frames.find((f) => f.url().includes("filesusr.com"));

  if (!widgetFrame) {
    await browser.close();
    throw new Error("Widget iframe not found — Wix may not have loaded it yet");
  }

  // Wait for class rows to appear before reading page data.
  await widgetFrame.waitForSelector(".bw-session", { timeout: 30000 });

  // Read each day and each class row from the widget.
  const classes = await widgetFrame.evaluate(() => {
    const results = [];
    const days = document.querySelectorAll(
      ".bw-widget__day:not(.bw-widget__day--empty)",
    );

    days.forEach((day) => {
      const dateEl = day.querySelector(".bw-widget__date");
      const dateAttr = dateEl?.className?.match(/date-(\d{4}-\d{2}-\d{2})/);
      const dateStr = dateAttr ? dateAttr[1] : null;
      if (!dateStr) return;

      const sessions = day.querySelectorAll(".bw-session:not(.is-cancelled)");
      sessions.forEach((session) => {
        const nameEl = session.querySelector(".bw-session__name");
        const typeEl = session.querySelector(".bw-session__type");
        const startTimeEl = session.querySelector(".hc_starttime");
        const endTimeEl = session.querySelector(".hc_endtime");
        const instructorEl = session.querySelector(".bw-session__staff");
        const bookingEl = session.querySelector(".bw-widget__cta");

        const typeText =
          typeEl?.textContent?.trim().replace(/-\s*$/, "").trim() || "";
        const fullNameText = nameEl?.textContent?.trim() || "";
        const className =
          fullNameText.replace(typeText, "").replace(/^-\s*/, "").trim() ||
          fullNameText;

        const startDatetime = startTimeEl?.getAttribute("datetime") || "";
        const endDatetime = endTimeEl?.getAttribute("datetime") || "";
        const instructor = instructorEl?.textContent?.trim() || null;
        const bookingUrl = bookingEl?.getAttribute("href") || null;

        results.push({
          className,
          typeText,
          dateStr,
          startDatetime,
          endDatetime,
          instructor,
          bookingUrl,
        });
      });
    });

    return results;
  });

  await browser.close();
  // Return every class we found.
  return { classes };
};

export {
  scrapeVisceral,
  parseSkillLevel,
  parseDate,
  parseTime,
  shouldIncludeClass,
  STUDIO_ID,
};

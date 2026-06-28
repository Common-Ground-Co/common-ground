import puppeteer from "puppeteer";

// ─── Node.js parsing helpers (private) ───────────────────────────────────────

// "June 29" → "2026-06-29". Falls back to next year if result is >60 days in the past.
function parseDate(dateText) {
  if (!dateText) return null;
  const currentYear = new Date().getFullYear();
  let d = new Date(`${dateText} ${currentYear}`);
  if (isNaN(d) || d < new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)) {
    d = new Date(`${dateText} ${currentYear + 1}`);
  }
  if (isNaN(d)) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// "7:15 pm" → "19:15"
function parseTime(timeText) {
  if (!timeText) return null;
  const match = timeText.match(/(\d+):(\d+)\s*(am|pm)/i);
  if (!match) return null;
  let hours = parseInt(match[1]);
  const minutes = match[2];
  const period = match[3].toLowerCase();
  if (period === "pm" && hours !== 12) hours += 12;
  if (period === "am" && hours === 12) hours = 0;
  return `${String(hours).padStart(2, "0")}:${minutes}`;
}

// "2026-06-28T19:45:00" → "2026-06-28"
function parseIsoDate(isoDatetime) {
  if (!isoDatetime) return null;
  return isoDatetime.split("T")[0] || null;
}

// "2026-06-28T19:45:00" → "19:45"
function parseIsoTime(isoDatetime) {
  if (!isoDatetime) return null;
  return isoDatetime.split("T")[1]?.slice(0, 5) || null;
}

// "Thursday, June 25, 2026" → "2026-06-25"
function parseDateFromSelected(text) {
  if (!text) return null;
  const match = text.match(/([A-Z][a-z]+),\s+([A-Z][a-z]+)\s+(\d{1,2}),\s+(\d{4})/);
  if (!match) return null;
  const d = new Date(`${match[2]} ${match[3]}, ${match[4]}`);
  if (isNaN(d)) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// "May 14, 2026, 8:15 PM – 9:30 PM" → "2026-05-14"
function parseDateFromEventText(text) {
  if (!text) return null;
  const match = text.match(/([A-Z][a-z]+)\s+(\d{1,2}),\s+(\d{4})/);
  if (!match) return null;
  const d = new Date(`${match[1]} ${match[2]}, ${match[3]}`);
  if (isNaN(d)) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// "May 14, 2026, 8:15 PM – 9:30 PM" → "20:15"
function parseTimeFromEventText(text) {
  if (!text) return null;
  const match = text.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return null;
  let hours = parseInt(match[1]);
  const minutes = match[2];
  const period = match[3].toLowerCase();
  if (period === "pm" && hours !== 12) hours += 12;
  if (period === "am" && hours === 12) hours = 0;
  return `${String(hours).padStart(2, "0")}:${minutes}`;
}

// null/"" → null; "/path" → full URL; "https://..." → as-is
function resolveBookingUrl(href) {
  if (!href) return null;
  if (href.startsWith("http")) return href;
  if (href.startsWith("/")) return `https://www.indiemediastudio.com${href}`;
  return null;
}

// ─── Wix Bookings Agenda (Puzzle Box) ────────────────────────────────────────

async function loadWixAgenda(page, config) {
  await page.goto(config.scheduleUrl, { waitUntil: "networkidle2", timeout: 60000 });
  await page.waitForSelector('[data-hook="daily-agenda-slot"]', { timeout: 30000 });

  let attempts = 0;
  while (attempts < 10) {
    const btn = await page.$('[data-hook="daily-agenda-load-more-button"]');
    if (!btn) break;
    try {
      await btn.click();
      await new Promise((r) => setTimeout(r, 1500));
      attempts++;
    } catch {
      break;
    }
  }

  const rawItems = await page.evaluate(() => {
    const results = [];
    document.querySelectorAll('[data-hook="daily-agenda-day"]').forEach((day) => {
      const dateText = day.querySelector('[data-hook="daily-agenda-day-date"]')?.textContent?.trim() || "";
      day.querySelectorAll('[data-hook="daily-agenda-slot"]').forEach((slot) => {
        const name = slot.querySelector(".s_KroQ2")?.textContent?.trim() || "";
        const timeRaw = slot.querySelector(".ssaqcAw")?.childNodes[0]?.textContent?.trim() || "";
        const instructor = slot.querySelector(".sHwjQAH")?.textContent?.trim() || "";
        if (name) results.push({ name, timeRaw, dateText, instructor });
      });
    });
    return results;
  });

  return rawItems.map((r) => ({
    className: r.name,
    instructor: r.instructor || null,
    date: parseDate(r.dateText),
    time: parseTime(r.timeRaw),
    bookingUrl: null,
  }));
}

// ─── Mindbody Iframe (Visceral) ───────────────────────────────────────────────

async function loadMindbodyIframe(page, config) {
  await page.goto(config.scheduleUrl, { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 12000));
  await new Promise((r) => setTimeout(r, 5000));

  const frames = page.frames();
  let widgetFrame = frames.find(
    (f) => f.url().includes("filesusr.com") || f.url().includes("wixapps.net"),
  );

  if (!widgetFrame) {
    for (const frame of frames) {
      try {
        const found = await frame.$(".bw-session");
        if (found) { widgetFrame = frame; break; }
      } catch { /* cross-origin frames throw — skip */ }
    }
  }

  if (!widgetFrame) {
    const frameUrls = frames.map((f) => f.url()).join("\n  ");
    throw new Error(`Visceral widget iframe not found.\nFrames available:\n  ${frameUrls}`);
  }

  await widgetFrame.waitForSelector(".bw-session", { timeout: 60000 });

  const rawItems = await widgetFrame.evaluate(() => {
    const results = [];
    document.querySelectorAll(".bw-widget__day:not(.bw-widget__day--empty)").forEach((day) => {
      const dateEl = day.querySelector(".bw-widget__date");
      const dateMatch = dateEl?.className?.match(/date-(\d{4}-\d{2}-\d{2})/);
      if (!dateMatch) return;

      day.querySelectorAll(".bw-session:not(.is-cancelled)").forEach((session) => {
        const nameEl = session.querySelector(".bw-session__name");
        const typeEl = session.querySelector(".bw-session__type");
        const startEl = session.querySelector(".hc_starttime");
        const instructorEl = session.querySelector(".bw-session__staff");
        const bookingEl = session.querySelector(".bw-widget__cta");

        const typeText = typeEl?.textContent?.trim().replace(/-\s*$/, "").trim() || "";
        const fullName = nameEl?.textContent?.trim() || "";
        const name = fullName.replace(typeText, "").replace(/^\s*-\s*/, "").trim() || fullName;

        const startDatetime = startEl?.getAttribute("datetime") || "";
        const instructor = (instructorEl?.textContent?.trim() || "").replace(/\s+/g, " ");
        const bookingUrl = bookingEl?.getAttribute("href") || "";

        if (name) results.push({ name, instructor, startDatetime, bookingUrl });
      });
    });
    return results;
  });

  return rawItems.map((r) => ({
    className: r.name,
    instructor: r.instructor || null,
    date: parseIsoDate(r.startDatetime),
    time: parseIsoTime(r.startDatetime),
    bookingUrl: r.bookingUrl || null,
  }));
}

// ─── Ribbon Widget (Dance Forever) ───────────────────────────────────────────

async function loadRibbon(page, config) {
  await page.goto(config.scheduleUrl, { waitUntil: "networkidle2", timeout: 60000 });
  await page.waitForSelector("#ribbon-schedule", { timeout: 30000 });
  await new Promise((r) => setTimeout(r, 2000));

  const classes = [];

  for (let week = 0; week < 2; week++) {
    if (week > 0) {
      const nextBtn = await page.$(".nextButton button");
      if (!nextBtn) break;
      await nextBtn.click();
      await new Promise((r) => setTimeout(r, 1500));
    }

    const dayIds = await page.evaluate(() =>
      Array.from(document.querySelectorAll(".week_day:not(.in_past)")).map((el) => el.id),
    );

    for (const dayId of dayIds) {
      await page.click(`[id="${dayId}"]`);
      await new Promise((r) => setTimeout(r, 1200));

      const dateText = await page.$eval("#selected_date", (el) => el.textContent?.trim() || "");
      const isoDate = parseDateFromSelected(dateText);

      const dayItems = await page.evaluate((id) => {
        const results = [];
        document.querySelectorAll(`li.schedule_item[data-id="${id}"]`).forEach((li) => {
          const rawName = li.querySelector(".event_title > span:first-child")?.textContent?.trim() || "";
          const name = rawName.replace(/\s*\(.*?\)\s*/g, "").trim();
          const instructor = li.querySelector(".teacher_name")?.textContent?.trim() || "";
          const timeRaw = li.querySelector(".class_time")?.textContent?.trim() || "";
          const bookingUrl = li.querySelector(".sign_up_button")?.getAttribute("href") || "";
          if (name) results.push({ name, instructor, timeRaw, bookingUrl });
        });
        return results;
      }, dayId);

      for (const r of dayItems) {
        classes.push({
          className: r.name,
          instructor: r.instructor || null,
          date: isoDate,
          time: parseTime(r.timeRaw),
          bookingUrl: r.bookingUrl || null,
        });
      }
    }
  }

  return classes;
}

// ─── Wix Events (Indie Media) ─────────────────────────────────────────────────

async function loadWixEvents(page, config) {
  await page.goto(config.scheduleUrl, { waitUntil: "networkidle2", timeout: 60000 });
  await page.waitForSelector('[data-hook="events-card"]', { timeout: 30000 });

  let attempts = 0;
  while (attempts < 10) {
    const btn = await page.$('[data-hook="load-more-button"]');
    if (!btn) break;
    try {
      await btn.click();
      await new Promise((r) => setTimeout(r, 1500));
      attempts++;
    } catch {
      break;
    }
  }

  const rawItems = await page.evaluate(() => {
    const results = [];
    document.querySelectorAll('[data-hook="events-card"]').forEach((card) => {
      const titleEl = card.querySelector('[data-hook="title"]');
      const dateEl = card.querySelector('[data-hook="date"]');
      const rsvpEl = card.querySelector('[data-hook="ev-rsvp-button"]');

      const rawTitle = titleEl?.textContent?.trim() || "";
      const hyphenIdx = rawTitle.indexOf(" - ");
      if (hyphenIdx === -1) return; // no hyphen = non-dance listing, skip

      const instructor = rawTitle.slice(0, hyphenIdx).trim();
      const className = rawTitle.slice(hyphenIdx + 3).replace(/\s*\(.*?\)\s*/g, "").trim();

      const dateTimeText = dateEl?.textContent?.trim() || "";
      const bookingHref = rsvpEl?.getAttribute("href") || titleEl?.getAttribute("href") || "";

      if (className) results.push({ className, instructor, dateTimeText, bookingHref });
    });
    return results;
  });

  return rawItems.map((r) => ({
    className: r.className,
    instructor: r.instructor || null,
    date: parseDateFromEventText(r.dateTimeText),
    time: parseTimeFromEventText(r.dateTimeText),
    bookingUrl: resolveBookingUrl(r.bookingHref),
  }));
}

// ─── Standard (future studios) ───────────────────────────────────────────────

async function loadStandard(page, config) {
  await page.goto(config.scheduleUrl, { waitUntil: "networkidle2", timeout: 60000 });
  if (config.waitFor) {
    await page.waitForSelector(config.waitFor, { timeout: 30000 });
  }
  return [];
}

// ─── Strategy map ─────────────────────────────────────────────────────────────

const STRATEGIES = {
  wixAgenda: loadWixAgenda,
  mindbodyIframe: loadMindbodyIframe,
  ribbon: loadRibbon,
  wixEvents: loadWixEvents,
  standard: loadStandard,
};

// ─── Main export ──────────────────────────────────────────────────────────────

export async function loadClasses(config) {
  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const strategy = STRATEGIES[config.loaderType] || STRATEGIES.standard;
    return await strategy(page, config);
  } finally {
    await browser.close();
  }
}

// Converts raw scraper text into DB-ready rows.

import * as chrono from "chrono-node";

// Parse dates into YYYY-MM-DD or null.
// Chrono handles fuzzy date strings.
export function normalizeDate(raw) {
  if (!raw) return null;

  // Use midnight so forwardDate compares by day.
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const results = chrono.parse(raw, startOfToday, { forwardDate: true });
  if (!results.length) return null;

  const { start } = results[0];
  if (!start.isCertain("month") || !start.isCertain("day")) return null;

  const year = start.get("year");
  const month = start.get("month");
  const day = start.get("day");
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// Parse times into HH:MM:00 or null.
export function normalizeTime(raw) {
  if (!raw) return null;

  const results = chrono.parse(raw);
  if (!results.length) return null;

  const { start } = results[0];
  if (!start.isCertain("hour")) return null;

  const hour = start.get("hour");
  const minute = start.get("minute");
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
}

export function getDayOfWeekFromIsoDate(isoDate) {
  const [year, month, day] = String(isoDate).split("-").map(Number);
  const utcDate = new Date(Date.UTC(year, month - 1, day));
  return utcDate.toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: "UTC",
  });
}

export function parseSkillLevel(className) {
  const lower = className.toLowerCase();
  if (/\bbeg\/int\b|\bint\/beg\b/.test(lower)) return "Beginner/Intermediate";
  if (/\bint\/adv\b|\badv\/int\b/.test(lower)) return "Intermediate/Advanced";
  if (/\bbeg(inner)?\b/.test(lower)) return "Beginner";
  if (/\bint(ermediate)?\b/.test(lower)) return "Intermediate";
  if (/\badv(anced)?\b|\bpro\b/.test(lower)) return "Advanced";
  if (/\bopen level\b/.test(lower)) return "All Levels";
  return "All Levels";
}

export function parseGenre(className) {
  const lower = className.toLowerCase();
  if (/\bafrobeats?\b/.test(lower)) return "Afrobeats";
  if (/\bdancehall\b/.test(lower)) return "Dancehall";
  if (/\breggaeton\b/.test(lower)) return "Reggaeton";
  if (/\bhip.?hop\b/.test(lower)) return "Hip-Hop";
  if (/\bheels\b/.test(lower)) return "Heels";
  if (/\bvogue\b|\bvouge\b/.test(lower)) return "Vogue";
  if (/\bwaacking\b|\bwacking\b/.test(lower)) return "Waacking";
  if (/\bjazz funk\b/.test(lower)) return "Jazz Funk";
  if (/\bjazz\b/.test(lower)) return "Jazz";
  if (/\bcontemporary\b|\bcontemp\b/.test(lower)) return "Contemporary";
  if (/\bballet\b/.test(lower)) return "Ballet";
  if (/\bbachata\b/.test(lower)) return "Bachata";
  if (/\bsalsa\b/.test(lower)) return "Salsa";
  if (/\bk.?pop\b/.test(lower)) return "K-Pop";
  if (/\bopen style\b/.test(lower)) return "Open Style";
  return null;
}

// Return true when a title looks kid-oriented.

function hasKidsAgeRange(className) {
  const rangeMatch = className.match(/ages\s+(\d+)\s*[-–]\s*(\d+)/i);
  if (rangeMatch) {
    return parseInt(rangeMatch[1]) < 20 && parseInt(rangeMatch[2]) < 20;
  }
  const plusMatch = className.match(/ages\s+(\d+)\s*\+/i);
  if (plusMatch) {
    return parseInt(plusMatch[1]) < 15;
  }
  return false;
}

// Filter by age, skip words, then allowed styles.
export function shouldInclude(className, allowedStyles, skipKeywords) {
  if (hasKidsAgeRange(className)) return false;
  const lower = className.toLowerCase();
  if (skipKeywords.some((kw) => lower.includes(kw.toLowerCase()))) return false;
  if (allowedStyles === null) return true;
  return allowedStyles.some((style) => lower.includes(style.toLowerCase()));
}

function resolveBookingUrl(href, baseUrl) {
  if (!href || href.startsWith("javascript:") || href === "#") return null;
  try {
    return new URL(href, baseUrl).href;
  } catch {
    return null;
  }
}

// Map raw rows to DB-shaped rows.
export function normalizeRows(rawRows, config) {
  return rawRows.map((r) => {
    const className = r.className || null;
    const date = normalizeDate(r.date);
    return {
      className,
      instructor: r.instructor || null,
      style: r.genre || (className ? parseGenre(className) : null),
      skillLevel: className ? parseSkillLevel(className) : null,
      date,
      dayOfWeek: date ? getDayOfWeekFromIsoDate(date) : r.day || null,
      time: normalizeTime(r.time ?? r.startTime),
      bookingUrl: resolveBookingUrl(r.bookingUrl, config.scheduleUrl),
    };
  });
}

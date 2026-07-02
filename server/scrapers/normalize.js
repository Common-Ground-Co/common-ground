// Normalization layer: raw strings extracted by a studio's own scraper in,
// DB-ready values out. Each scraper hardcodes its selectors and owns getting
// the raw text off the page; this file owns turning that raw text into
// consistent dates/times/styles — no knowledge of any studio's markup.

const DAY_NAMES = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

function fmtDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Any raw string → "YYYY-MM-DD" or null. Cascade of the date shapes studio
// sites actually use; add cases here (not to schemas) when a new one shows up.
export function normalizeDate(raw) {
  if (!raw) return null;

  // Embedded ISO date — also catches attribute values like "date-2026-06-28"
  // and full ISO datetimes.
  const iso = raw.match(/\d{4}-\d{2}-\d{2}/);
  if (iso) return iso[0];

  // "June 25, 2026" / "Thursday, June 25, 2026" / "May 14, 2026, 8:15 PM"
  let m = raw.match(/([A-Z][a-z]{2,8})\.?\s+(\d{1,2})(?:st|nd|rd|th)?,\s+(\d{4})/);
  if (m) {
    const d = new Date(`${m[1]} ${m[2]}, ${m[3]}`);
    if (!isNaN(d)) return fmtDate(d);
  }

  // Month + day with no year ("June 29", "Jun 29", "Tue, Jun 30") — assume the
  // current year, roll to next year if that lands more than 60 days in the past.
  m = raw.match(/([A-Z][a-z]{2,8})\.?\s+(\d{1,2})(?:st|nd|rd|th)?\b/);
  if (m) {
    const currentYear = new Date().getFullYear();
    let d = new Date(`${m[1]} ${m[2]}, ${currentYear}`);
    if (isNaN(d) || d < new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)) {
      d = new Date(`${m[1]} ${m[2]}, ${currentYear + 1}`);
    }
    if (!isNaN(d)) return fmtDate(d);
  }

  return null;
}

// Any raw string → "HH:MM:00" (24-hour) or null.
export function normalizeTime(raw) {
  if (!raw) return null;

  // ISO datetime ("2026-06-28T19:45:00")
  let m = raw.match(/T(\d{2}):(\d{2})/);
  if (m) return `${m[1]}:${m[2]}:00`;

  // "7:15 pm" / "8:15 PM" — must run before the bare HH:MM case
  m = raw.match(/(\d{1,2}):(\d{2})\s*(am|pm)/i);
  if (m) {
    let hours = parseInt(m[1]);
    const period = m[3].toLowerCase();
    if (period === "pm" && hours !== 12) hours += 12;
    if (period === "am" && hours === 12) hours = 0;
    return `${String(hours).padStart(2, "0")}:${m[2]}:00`;
  }

  // "7 pm" with no minutes
  m = raw.match(/\b(\d{1,2})\s*(am|pm)\b/i);
  if (m) {
    let hours = parseInt(m[1]);
    const period = m[2].toLowerCase();
    if (period === "pm" && hours !== 12) hours += 12;
    if (period === "am" && hours === 12) hours = 0;
    return `${String(hours).padStart(2, "0")}:00:00`;
  }

  // Already 24-hour "19:15"
  m = raw.match(/\b(\d{1,2}):(\d{2})\b/);
  if (m && parseInt(m[1]) < 24 && parseInt(m[2]) < 60) {
    return `${m[1].padStart(2, "0")}:${m[2]}:00`;
  }

  return null;
}

// "Monday" / "MON" / "every Tuesday" → the next occurrence of that weekday
// (today counts), as "YYYY-MM-DD". For weekly-recurring schedules that list a
// day but no date.
export function resolveDayToDate(raw, from = new Date()) {
  if (!raw) return null;
  const lower = raw.toLowerCase();
  const idx = DAY_NAMES.findIndex(
    (name) => lower.includes(name) || lower.includes(name.slice(0, 3)),
  );
  if (idx === -1) return null;
  const d = new Date(from);
  d.setDate(d.getDate() + ((idx - d.getDay() + 7) % 7));
  return fmtDate(d);
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

// Returns true if the class name targets kids based on its age specification.
// Catches two patterns:
//   "Ages X-Y" where both X and Y are under 20 (e.g. "Ages 4-7", "Ages 8-12")
//   "Ages X+" where X is under 15 (e.g. "Ages 8+") — 15+ is borderline adult so we keep those
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

// Decides whether a class should be included in the scrape results.
// Runs three checks in order: kids age range, skip keywords, then allowed styles.
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

// Raw scraper rows → DB-shaped rows. Date resolution order: the row's own date
// field, then a weekly day name resolved to its next occurrence. Time comes
// from whichever of `time` / `startTime` the studio's scraper populated.
export function normalizeRows(rawRows, config) {
  return rawRows.map((r) => {
    const className = r.className || null;
    const date = normalizeDate(r.date) ?? resolveDayToDate(r.day) ?? null;
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

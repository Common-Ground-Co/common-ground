// Shared parsing utilities used by runScrapers.js to classify and filter scraped classes.
// All four studios run through these same functions so changes here affect every scraper.

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

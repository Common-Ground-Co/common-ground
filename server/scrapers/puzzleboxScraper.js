// server/scrapers/puzzleboxScraper.js

// Scrapes The Puzzle Box Dance Studio's Wix Bookings "Daily Agenda" widget.

const DAY_GROUP_SELECTOR = 'li[data-hook="daily-agenda-day"]';
const DAY_DATE_SELECTOR = '[data-hook="daily-agenda-day-date"]';
const SESSION_SELECTOR = 'li[data-hook="daily-agenda-slot"]';

// No data-hook exists on these fields, they are auto-generated
const CLASS_NAME_SELECTOR = ".s_KroQ2";
const INSTRUCTOR_SELECTOR = ".sHwjQAH";
const TIME_SELECTOR = ".ssaqcAw";
const AVATAR_SELECTOR = "[data-initials]";

const MAX_DAYS = 10;
const MAX_LOAD_MORE_CLICKS = 15;
const LOAD_MORE_WAIT_MS = 600;

async function loadDaysUpToLimit(page) {
  let lastCount = await page
    .evaluate(
      (sel) => document.querySelectorAll(sel).length,
      DAY_GROUP_SELECTOR,
    )
    .catch(() => 0);

  if (lastCount >= MAX_DAYS) return;

  for (let i = 0; i < MAX_LOAD_MORE_CLICKS; i++) {
    const clicked = await page.evaluate(() => {
      const btn = [...document.querySelectorAll("button")].find((b) =>
        /load more/i.test(b.textContent || ""),
      );
      if (btn && !btn.disabled) {
        btn.scrollIntoView({ block: "center" });
        btn.click();
        return true;
      }
      return false;
    });

    if (!clicked) break;

    await new Promise((r) => setTimeout(r, LOAD_MORE_WAIT_MS));

    const newCount = await page.evaluate(
      (sel) => document.querySelectorAll(sel).length,
      DAY_GROUP_SELECTOR,
    );

    if (newCount <= lastCount || newCount >= MAX_DAYS) break;
    lastCount = newCount;
  }
}

export async function scrapePuzzlebox(page, config) {
  await page.goto(config.scheduleUrl, {
    waitUntil: "networkidle0",
    timeout: 60000,
  });

  await page
    .waitForSelector(SESSION_SELECTOR, { timeout: 15000 })
    .catch(() => {});
  await loadDaysUpToLimit(page);

  const rawClasses = await page.evaluate(
    (
      dayGroupSel,
      dayDateSel,
      sessionSel,
      classNameSel,
      instructorSel,
      timeSel,
      avatarSel,
      maxDays,
    ) => {
      const results = [];
      const dayGroups = [...document.querySelectorAll(dayGroupSel)].slice(
        0,
        maxDays,
      );

      dayGroups.forEach((dayGroup) => {
        const dayDateEl = dayGroup.querySelector(dayDateSel);
        const dateText = dayDateEl ? dayDateEl.textContent.trim() : null;

        // Weekday label has no data-hook, so this reads the second span
        // next to the date as a fallback only.
        const weekdayEl = dayDateEl?.parentElement?.querySelectorAll("span")[1];
        const weekdayText = weekdayEl ? weekdayEl.textContent.trim() : null;

        dayGroup.querySelectorAll(sessionSel).forEach((session) => {
          const nameEl = session.querySelector(classNameSel);
          const className = nameEl ? nameEl.textContent.trim() : null;

          // Prefer the avatar's title attribute for the instructor name
          // since the visible label span can get truncated.
          const avatarEl = session.querySelector(avatarSel);
          const instructorEl = session.querySelector(instructorSel);
          const instructor =
            avatarEl?.getAttribute("title")?.trim() ||
            (instructorEl ? instructorEl.textContent.trim() : null);

          // Raw text looks like "6:00 pm(1 hr)", so this pulls just the
          // leading clock time and drops the duration.
          const timeEl = session.querySelector(timeSel);
          const timeText = timeEl ? timeEl.textContent.trim() : "";
          const startTimeMatch = timeText.match(/^\d{1,2}:\d{2}\s*[ap]m/i);
          const startTime = startTimeMatch ? startTimeMatch[0] : null;

          results.push({
            className,
            instructor,
            date: dateText,
            day: weekdayText,
            startTime,
            bookingUrl: null,
          });
        });
      });

      return results;
    },
    DAY_GROUP_SELECTOR,
    DAY_DATE_SELECTOR,
    SESSION_SELECTOR,
    CLASS_NAME_SELECTOR,
    INSTRUCTOR_SELECTOR,
    TIME_SELECTOR,
    AVATAR_SELECTOR,
    MAX_DAYS,
  );

  return rawClasses;
}

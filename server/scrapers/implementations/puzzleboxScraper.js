// Scrapes The Puzzle Box Dance Studio's daily agenda widget.

const SELECTORS = {
  dayGroup: 'li[data-hook="daily-agenda-day"]',
  dayDate: '[data-hook="daily-agenda-day-date"]',
  session: 'li[data-hook="daily-agenda-slot"]',
  className: ".s_KroQ2",
  instructor: ".sHwjQAH",
  time: ".ssaqcAw",
  avatar: "[data-initials]",
};

const MAX_DAYS = 10;
const MAX_LOAD_MORE_CLICKS = 15;
const LOAD_MORE_WAIT_MS = 600;

async function loadMoreUntilWindow(page) {
  let lastCount = await page
    .evaluate(
      (selectors) => document.querySelectorAll(selectors.dayGroup).length,
      SELECTORS,
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
      (selectors) => document.querySelectorAll(selectors.dayGroup).length,
      SELECTORS,
    );

    if (newCount <= lastCount || newCount >= MAX_DAYS) break;
    lastCount = newCount;
  }
}

export async function scrapePuzzlebox(page, config) {
  await page.goto(config.scheduleUrl, {
    waitUntil: "domcontentloaded",
    timeout: 90000,
  });

  await page
    .waitForSelector(SELECTORS.session, { timeout: 30000 })
    .catch(() => {});
  await loadMoreUntilWindow(page);

  const rawClasses = await page.evaluate((selectors) => {
    const results = [];
    const dayGroups = document.querySelectorAll(selectors.dayGroup);

    dayGroups.forEach((dayGroup) => {
      const dayDateEl = dayGroup.querySelector(selectors.dayDate);
      const dateText = dayDateEl ? dayDateEl.textContent.trim() : null;

      // Read the weekday from the date row fallback.
      const weekdayEl = dayDateEl?.parentElement?.querySelectorAll("span")[1];
      const weekdayText = weekdayEl ? weekdayEl.textContent.trim() : null;

      dayGroup.querySelectorAll(selectors.session).forEach((session) => {
        const nameEl = session.querySelector(selectors.className);
        const className = nameEl ? nameEl.textContent.trim() : null;

        // Prefer the avatar title for the instructor name.
        const avatarEl = session.querySelector(selectors.avatar);
        const instructorEl = session.querySelector(selectors.instructor);
        const instructor =
          avatarEl?.getAttribute("title")?.trim() ||
          (instructorEl ? instructorEl.textContent.trim() : null);

        // Pull the clock time and drop the duration.
        const timeEl = session.querySelector(selectors.time);
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
  }, SELECTORS);

  return rawClasses;
}

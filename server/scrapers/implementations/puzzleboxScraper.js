// Scrapes The Puzzle Box Dance Studio's daily agenda widget.

const SELECTORS = {
  dayGroup: 'li[data-hook="daily-agenda-day"]',
  dayDate: '[data-hook="daily-agenda-day-date"]',
  session: 'li[data-hook="daily-agenda-slot"]',
  className: ".s_KroQ2",
  instructor: ".sHwjQAH",
  time: ".ssaqcAw",
  avatar: "[data-initials]",
  traceQsa: process.env.TRACE_QSA === "1",
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
    const clicked = await page.evaluate((selectors) => {
      const qsa = (root, label, selector) => {
        const nodes = root.querySelectorAll(selector);
        if (selectors.traceQsa) {
          console.log(`[puzzlebox:${label}] ${selector} -> ${nodes.length}`);
          debugger;
        }
        return nodes;
      };

      const btn = [...qsa(document, "buttons", "button")].find((b) =>
        /load more/i.test(b.textContent || ""),
      );
      if (btn && !btn.disabled) {
        btn.scrollIntoView({ block: "center" });
        btn.click();
        return true;
      }
      return false;
    }, SELECTORS);

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
    waitUntil: "networkidle0",
    timeout: 60000,
  });

  await page
    .waitForSelector(SELECTORS.session, { timeout: 15000 })
    .catch(() => {});
  await loadMoreUntilWindow(page);

  const rawClasses = await page.evaluate((selectors) => {
    const results = [];

    const qsa = (root, label, selector) => {
      const nodes = root.querySelectorAll(selector);
      if (selectors.traceQsa) {
        console.log(`[puzzlebox:${label}] ${selector} -> ${nodes.length}`);
        debugger;
      }
      return nodes;
    };

    const dayGroups = qsa(document, "dayGroups", selectors.dayGroup);

    dayGroups.forEach((dayGroup) => {
      const dayDateEl = dayGroup.querySelector(selectors.dayDate);
      const dateText = dayDateEl ? dayDateEl.textContent.trim() : null;

      // Read the weekday from the date row fallback.
      const weekdayEl = qsa(
        dayDateEl?.parentElement ?? dayGroup,
        "weekdaySpans",
        "span",
      )[1];
      const weekdayText = weekdayEl ? weekdayEl.textContent.trim() : null;

      qsa(dayGroup, "sessions", selectors.session).forEach((session) => {
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

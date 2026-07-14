// Scrapes Indie Media Studio's upcoming class cards.

const SELECTORS = {
  card: 'li[data-hook="events-card"]',
  title: 'a[data-hook="title"]',
  date: 'div[data-hook="date"]',
  rsvp: 'a[data-hook="ev-rsvp-button"]',
  loadMore: 'button[data-hook="load-more-button"]',
};

const MAX_DAYS_OUT = 10;
const MAX_LOAD_MORE_CLICKS = 15;
const LOAD_MORE_WAIT_MS = 600;

// Load more cards until the date window is full.
async function loadMoreUntilWindow(page) {
  const cutoffTime = Date.now() + MAX_DAYS_OUT * 24 * 60 * 60 * 1000;
  let lastCount = 0;

  for (let i = 0; i < MAX_LOAD_MORE_CLICKS; i++) {
    const { count, maxDateTime } = await page.evaluate((selectors) => {
      const dates = [...document.querySelectorAll(selectors.date)]
        .map((el) => {
          const m = el.textContent.match(/[A-Z][a-z]{2}\s+\d{1,2},\s+\d{4}/);
          return m ? new Date(m[0]).getTime() : NaN;
        })
        .filter((t) => !Number.isNaN(t));
      return {
        count: document.querySelectorAll(selectors.card).length,
        maxDateTime: dates.length ? Math.max(...dates) : -Infinity,
      };
    }, SELECTORS);

    if (maxDateTime >= cutoffTime || count <= lastCount) break;
    lastCount = count;

    const clicked = await page.evaluate((sel) => {
      const btn = document.querySelector(sel);
      if (btn && !btn.disabled) {
        btn.scrollIntoView({ block: "center" });
        btn.click();
        return true;
      }
      return false;
    }, SELECTORS.loadMore);

    if (!clicked) break;

    await new Promise((r) => setTimeout(r, LOAD_MORE_WAIT_MS));
  }
}

export async function scrapeIndieMedia(page, config) {
  await page.goto(config.scheduleUrl, {
    waitUntil: "networkidle0",
    timeout: 60000,
  });

  await page
    .waitForSelector(SELECTORS.card, { timeout: 15000 })
    .catch(() => {});
  await loadMoreUntilWindow(page);

  const rawClasses = await page.evaluate((selectors) => {
    const results = [];

    document.querySelectorAll(selectors.card).forEach((card) => {
      const titleEl = card.querySelector(selectors.title);
      const titleText = titleEl ? titleEl.textContent.trim() : null;

      // Split instructor and class names on spaced dashes only.
      let instructor = null;
      let className = titleText;
      if (titleText) {
        const parts = titleText.split(/\s+[-–—]\s+/);
        if (parts.length === 2) [instructor, className] = parts;
      }

      // Date text carries both the date and time.
      const dateEl = card.querySelector(selectors.date);
      const dateText = dateEl ? dateEl.textContent.trim() : null;

      const rsvpEl = card.querySelector(selectors.rsvp);
      const bookingUrl = rsvpEl ? rsvpEl.getAttribute("href") : null;

      results.push({
        className,
        instructor,
        date: dateText,
        startTime: dateText,
        bookingUrl,
      });
    });

    return results;
  }, SELECTORS);

  return rawClasses;
}

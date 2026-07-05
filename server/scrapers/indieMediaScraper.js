// server/scrapers/indieMediaScraper.js
//
// Scrapes Indie Media Studio's "Upcoming Classes" section (Wix Events cards)
// on their homepage.

const CARD_SELECTOR = 'li[data-hook="events-card"]';
const TITLE_SELECTOR = 'a[data-hook="title"]';
const DATE_SELECTOR = 'div[data-hook="date"]';
const RSVP_SELECTOR = 'a[data-hook="ev-rsvp-button"]';
const LOAD_MORE_SELECTOR = 'button[data-hook="load-more-button"]';

const MAX_DAYS_OUT = 10;
const MAX_LOAD_MORE_CLICKS = 15;
const LOAD_MORE_WAIT_MS = 600;

// Click "Load More"
async function loadCardsUpToWindow(page) {
  const cutoffTime = Date.now() + MAX_DAYS_OUT * 24 * 60 * 60 * 1000;
  let lastCount = 0;

  for (let i = 0; i < MAX_LOAD_MORE_CLICKS; i++) {
    const { count, maxDateTime } = await page.evaluate(
      (dateSel, cardSel) => {
        const dates = [...document.querySelectorAll(dateSel)]
          .map((el) => {
            const m = el.textContent.match(/[A-Z][a-z]{2}\s+\d{1,2},\s+\d{4}/);
            return m ? new Date(m[0]).getTime() : NaN;
          })
          .filter((t) => !Number.isNaN(t));
        return {
          count: document.querySelectorAll(cardSel).length,
          maxDateTime: dates.length ? Math.max(...dates) : -Infinity,
        };
      },
      DATE_SELECTOR,
      CARD_SELECTOR,
    );

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
    }, LOAD_MORE_SELECTOR);

    if (!clicked) break;

    await new Promise((r) => setTimeout(r, LOAD_MORE_WAIT_MS));
  }
}

export async function scrapeIndieMedia(page, config) {
  await page.goto(config.scheduleUrl, {
    waitUntil: "networkidle0",
    timeout: 60000,
  });

  await page.waitForSelector(CARD_SELECTOR, { timeout: 15000 }).catch(() => {});
  await loadCardsUpToWindow(page);

  const rawClasses = await page.evaluate(
    (cardSel, titleSel, dateSel, rsvpSel) => {
      const results = [];

      document.querySelectorAll(cardSel).forEach((card) => {
        const titleEl = card.querySelector(titleSel);
        const titleText = titleEl ? titleEl.textContent.trim() : null;

        // Titles look like "Angel — Int Heels Class (Monday)" or
        // "Raquel - Heels Class (Tuesday)" — instructor glued on the front,
        // separator varies between an em dash and a plain hyphen. Split only
        // when it's surrounded by spaces so hyphens inside class names
        // (e.g. "K-Pop") aren't mistaken for it.
        let instructor = null;
        let className = titleText;
        if (titleText) {
          const parts = titleText.split(/\s+[-–—]\s+/);
          if (parts.length === 2) [instructor, className] = parts;
        }

        // "Jul 04, 2026, 1:00 PM – Jul 05, 2026, 6:00 PM" — one string
        // carries both date and time
        const dateEl = card.querySelector(dateSel);
        const dateText = dateEl ? dateEl.textContent.trim() : null;

        const rsvpEl = card.querySelector(rsvpSel);
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
    },
    CARD_SELECTOR,
    TITLE_SELECTOR,
    DATE_SELECTOR,
    RSVP_SELECTOR,
  );

  return rawClasses;
}

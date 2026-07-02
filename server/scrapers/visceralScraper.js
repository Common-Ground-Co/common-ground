// server/scrapers/visceralScraper.js
//
// Bare minimum selector scrape for Visceral Dance Chicago's Mindbody Booker
// widget. Structure is known and stable enough to hardcode directly,
// no LLM schema derivation needed for this studio.
//
// The widget itself renders inside a Wix static-html embed iframe
// (*.filesusr.com), not the top-level document — the schedule markup never
// appears on the classschedule page itself.

const EMBED_FRAME_MARKER = "filesusr.com";
const SESSION_SELECTOR = ".bw-session";
const NAME_SELECTOR = ".bw-session__name";
const STAFF_SELECTOR = ".bw-session__staff";
const START_TIME_SELECTOR = ".hc_starttime";
const BOOKING_LINK_SELECTOR = "a.bw-widget__cta.signup_now";
const DAY_HEADER_SELECTOR = ".bw-widget__date";
const DAY_GROUP_SELECTOR = ".bw-widget__day";

export async function scrapeVisceral(page, config) {
  await page.goto(config.scheduleUrl, {
    waitUntil: "networkidle0",
    timeout: 60000,
  });

  const frame =
    page.frames().find((f) => f.url().includes(EMBED_FRAME_MARKER)) ?? page;

  await frame.waitForSelector(SESSION_SELECTOR, { timeout: 15000 }).catch(() => {});

  const rawClasses = await frame.evaluate(
    (dayGroupSel, dayHeaderSel, sessionSel, nameSel, staffSel, startTimeSel, bookingSel) => {
      const results = [];

      const dayGroups = document.querySelectorAll(dayGroupSel);

      dayGroups.forEach((dayGroup) => {
        const dayHeaderEl = dayGroup.querySelector(dayHeaderSel);
        const dayHeaderText = dayHeaderEl ? dayHeaderEl.textContent.trim() : null;

        // date lives in the class attribute, e.g. "date-2026-07-02"
        let isoDate = null;
        if (dayHeaderEl) {
          const dateClass = [...dayHeaderEl.classList].find((c) => c.startsWith("date-"));
          if (dateClass) isoDate = dateClass.replace("date-", "");
        }

        const sessions = dayGroup.querySelectorAll(sessionSel);

        sessions.forEach((session) => {
          if (session.classList.contains("bw-session--empty")) return;
          if (session.classList.contains("is-cancelled")) return;

          const nameEl = session.querySelector(nameSel);
          const staffEl = session.querySelector(staffSel);
          const startTimeEl = session.querySelector(startTimeSel);
          const bookingEl = session.querySelector(bookingSel);

          // className: strip the leading "Type - " prefix span, keep the real name
          let className = null;
          if (nameEl) {
            const clone = nameEl.cloneNode(true);
            const typeSpan = clone.querySelector(".bw-session__type");
            if (typeSpan) typeSpan.remove();
            className = clone.textContent.trim();
          }

          // instructor: strip "(substitute)" span if present
          let instructor = null;
          if (staffEl) {
            const clone = staffEl.cloneNode(true);
            const subSpan = clone.querySelector(".bw-session__sub");
            if (subSpan) subSpan.remove();
            instructor = clone.textContent.trim();
          }

          const startTime = startTimeEl
            ? startTimeEl.getAttribute("datetime")
            : null;

          const bookingUrl = bookingEl ? bookingEl.getAttribute("href") : null;

          results.push({
            className,
            instructor,
            date: isoDate,
            day: dayHeaderText,
            startTime, // ISO datetime, e.g. "2026-07-02T18:30"
            bookingUrl,
          });
        });
      });

      return results;
    },
    DAY_GROUP_SELECTOR,
    DAY_HEADER_SELECTOR,
    SESSION_SELECTOR,
    NAME_SELECTOR,
    STAFF_SELECTOR,
    START_TIME_SELECTOR,
    BOOKING_LINK_SELECTOR
  );

  return rawClasses;
}

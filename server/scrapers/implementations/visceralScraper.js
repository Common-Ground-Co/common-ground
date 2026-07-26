// Scrapes Visceral Dance Chicago's embedded schedule widget.

const EMBED_FRAME_MARKER = "filesusr.com";
const SELECTORS = {
  session: ".bw-session",
  name: ".bw-session__name",
  staff: ".bw-session__staff",
  startTime: ".hc_starttime",
  bookingLink: "a.bw-widget__cta.signup_now",
  dayHeader: ".bw-widget__date",
  dayGroup: ".bw-widget__day",
};

export async function scrapeVisceral(page, config) {
  await page.goto(config.scheduleUrl, {
    waitUntil: "domcontentloaded",
    timeout: 90000,
  });

  const iframeHandle = await page
    .waitForSelector("wix-iframe iframe", { timeout: 30000 })
    .catch(() => null);

  const frame = iframeHandle
    ? await iframeHandle.contentFrame()
    : page.frames().find((f) => f.url().includes(EMBED_FRAME_MARKER));

  const scrapeFrame = frame ?? page;

  await scrapeFrame
    .waitForSelector(SELECTORS.session, { timeout: 30000 })
    .catch(() => {});

  const rawClasses = await scrapeFrame.evaluate((selectors) => {
    const results = [];

    const dayGroups = document.querySelectorAll(selectors.dayGroup);

    dayGroups.forEach((dayGroup) => {
      const dayHeaderEl = dayGroup.querySelector(selectors.dayHeader);
      const dayHeaderText = dayHeaderEl ? dayHeaderEl.textContent.trim() : null;

      // Read the ISO date from the day header class.
      let isoDate = null;
      if (dayHeaderEl) {
        const dateClass = [...dayHeaderEl.classList].find((c) =>
          c.startsWith("date-"),
        );
        if (dateClass) isoDate = dateClass.replace("date-", "");
      }

      const sessions = dayGroup.querySelectorAll(selectors.session);

      sessions.forEach((session) => {
        if (session.classList.contains("bw-session--empty")) return;
        if (session.classList.contains("is-cancelled")) return;

        const nameEl = session.querySelector(selectors.name);
        const staffEl = session.querySelector(selectors.staff);
        const startTimeEl = session.querySelector(selectors.startTime);
        const bookingEl = session.querySelector(selectors.bookingLink);

        // Strip the type prefix from the class name.
        let className = null;
        if (nameEl) {
          const clone = nameEl.cloneNode(true);
          const typeSpan = clone.querySelector(".bw-session__type");
          if (typeSpan) typeSpan.remove();
          className = clone.textContent.trim();
        }

        // Strip the substitute label from the instructor name.
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
          startTime, // ISO datetime string.
          bookingUrl,
        });
      });
    });

    return results;
  }, SELECTORS);

  return rawClasses;
}

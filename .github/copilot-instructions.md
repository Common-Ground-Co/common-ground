# Studio Scraper Generation Rule

When generating a new studio scraper, always follow this pattern:

## Navigation

- Always use `waitUntil: "domcontentloaded"` for `page.goto()`. Never use `networkidle0`. This is because I will always provide all necessary selectors to extract data, so there is no need to “wait for all network requests to stop”.
- Always follow navigation with `page.waitForSelector(...)` targeting the actual data container selector (reasonable timeout (15–30s).

## Iframe handling

- Check the provided HTML structure to determine whether the target content is inside an `<iframe>`.
- If the pasted HTML shows the data container nested inside an `<iframe>` element: generate code that accesses that frame (via `page.frames()` / `frame.waitForSelector`) before querying selectors.
- If the pasted HTML shows the data container directly in the main document (no `<iframe>` ancestor): do not generate any iframe-handling code at all.

## Selectors

- Group all selectors into a single `SELECTORS` object at the top of the file, keyed by semantic name (e.g. `dayGroup`, `session`, `className`, `instructor`, `time`).
- Prefer stable `data-hook` / `data-testid` attributes over hashed/generated class names. Only fall back to hashed classes when no stable attribute exists.

## Algorithm structure

1. Open page — `page.goto()` with `domcontentloaded`, then `waitForSelector` on the primary data container.
2. Handle pagination/loading pattern:
   - If infinite scroll: scroll incrementally and wait for new items to appear (compare counts before/after) until no new items load or a max cap is hit.
   - If "Load More" button: click repeatedly (with short waits between clicks) until the button disappears/disables or a max cap is hit.
   - If neither: skip this step.
3. Extract data using the grouped `SELECTORS` object inside a `page.evaluate()` call.
4. Format/sanitize extracted data (trim text, parse dates/times, drop duration suffixes, normalize instructor names, skip entries that don't match expected title patterns, etc.).
5. Return a clean array of objects to the pipeline

## Config-driven rules

- Always check `studios.config.js` for studio-specific rules (e.g. `allowedStyles`, keywords to skip, max days/items, custom title-parsing patterns) and apply them during the sanitize step; never hardcode rules that belong in config.

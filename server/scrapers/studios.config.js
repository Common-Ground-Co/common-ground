// Studio facts. Each studio owns its own scraper file (e.g. visceralScraper.js)
// with selectors hardcoded for that site's markup — this config just supplies
// the identity/location/filtering info that scraper needs, plus the DB target.
// runScrapers.js maps `key` to the matching scraper function.
export default [
  {
    key: "visceral",
    studioId: 1,
    studioName: "Visceral Dance Chicago",
    scheduleUrl: "https://www.visceraldance.com/classschedule",
    allowedStyles: [
      "hip hop",
      "hip-hop",
      "open",
      "k-pop",
      "kpop",
      "heels",
      "wacking",
      "waacking",
      "vogue",
      "vouge",
      "jazz",
      "contemporary",
      "ballet",
      "tap",
      "modern",
    ],
    skipKeywords: [
      "youth",
      "kids",
      "kid",
      "children",
      "closed",
      "virtual",
      "pilates",
      "bemoved",
    ],
  },
  // Remaining studios are queued for their own scraper files — runScrapers.js
  // skips any key with no registered scraper, so these are safe to leave here.
  {
    key: "puzzlebox",
    studioId: 2,
    studioName: "The Puzzle Box Dance Studio",
    scheduleUrl: "https://www.thepuzzleboxdancestudio.com/book-by-calendar",
    allowedStyles: null,
    skipKeywords: ["kids"],
  },
  {
    key: "danceforever",
    studioId: 5,
    studioName: "Dance Forever",
    scheduleUrl: "https://www.dance-forever.com/schedule",
    allowedStyles: null,
    skipKeywords: ["cardio"],
  },
  // {
  //   key: "hive",
  //   studioId: 3,
  //   studioName: "The Hive",
  //   scheduleUrl: "https://www.thehive.dance/adult-classes",
  //   allowedStyles: null,
  //   skipKeywords: [],
  // },
  {
    key: "indiemedia",
    studioId: 4,
    studioName: "Indie Media Studio",
    scheduleUrl: "https://www.indiemediastudio.com/",
    // The "Upcoming Classes" feed also carries one-off non-class events
    // (showcases, watch parties, etc). Every real class title ends in
    // "...Class (Weekday)", so requiring "class" is more durable than
    // maintaining a skip-keyword per event type as they come and go.
    allowedStyles: ["class"],
    skipKeywords: ["day pass", "academy"],
  },
];

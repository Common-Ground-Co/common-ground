import { useEffect, useState } from "react";
import Navigation from "../components/Navigation.jsx";
import { fetchIgAccounts } from "../services/igAccountsService.js";
import "../css/IgClassRadarPage.css";

const bannerImageSrc = "https://i.imgur.com/5rl3AP3.jpeg";

const TYPE_LABELS = {
  instructor: "Instructor",
  dance_team: "Dance Team",
  collective: "Collective",
};

function IgClassRadarPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadIgAccounts = async () => {
      try {
        setLoading(true);
        const data = await fetchIgAccounts();
        setEntries(data);
      } catch (err) {
        setError(err.message || "Unable to load IG accounts");
      } finally {
        setLoading(false);
      }
    };
    loadIgAccounts();
  }, []);

  return (
    <div className="radar-page">
      {/* Hero banner — fades out at bottom like homepage */}
      <section className="radar-hero">
        <img
          className="radar-hero-image"
          src={bannerImageSrc}
          alt="Chicago dance community"
        />
        <div className="radar-hero-overlay" />
      </section>

      <Navigation variant="category-strip--floating" />

      <main className="radar-container">
        {/* Page header */}
        <section className="radar-header">
          <h1>Instagram Class Radar</h1>
          <div>
            Chicago's independent dance instructors, teams, and collectives
            worth following — curated picks for finding classes, workshops, and
            community events outside the studio walls.
          </div>
        </section>

        {/* Cards */}
        {loading ? (
          <p className="radar-message">Loading...</p>
        ) : error ? (
          <p className="radar-message error">{error}</p>
        ) : entries.length === 0 ? (
          <p className="radar-message">Nothing here yet. Check back soon.</p>
        ) : (
          <div className="radar-list">
            {entries.map((entry) => (
              <article key={entry.id} className="radar-card">
                {/* Left column: photo */}
                <div className="radar-card-image">
                  {entry.photo_url ? (
                    <img
                      src={entry.photo_url}
                      alt={entry.name}
                      loading="lazy"
                    />
                  ) : (
                    <div className="radar-card-image-placeholder">
                      <i className="fa-brands fa-instagram" />
                    </div>
                  )}
                </div>

                {/* Right column */}
                <div className="radar-card-body">
                  {/* Row 1: main info */}
                  <div className="radar-card-info">
                    <div className="radar-card-title-row">
                      <h2>{entry.name}</h2>
                      {entry.type && (
                        <span className="radar-type-badge">
                          {TYPE_LABELS[entry.type] || entry.type}
                        </span>
                      )}
                    </div>

                    {entry.instagram && (
                      <p className="radar-insta-handle">
                        <i
                          className="fa-brands fa-instagram"
                          aria-hidden="true"
                        />
                        {entry.instagram.startsWith("@")
                          ? entry.instagram
                          : `@${entry.instagram}`}
                      </p>
                    )}

                    {entry.description && (
                      <>
                        <h3 className="radar-section-label">About</h3>
                        <p className="radar-description">{entry.description}</p>
                      </>
                    )}

                    <h3 className="radar-section-label">Stay Updated</h3>
                    <p className="radar-stay-updated">
                      Follow on Instagram for class announcements, workshop
                      drops, and community events.
                    </p>
                  </div>

                  {/* Row 2: links bar */}
                  <div className="radar-card-links">
                    {entry.instagram && (
                      <a
                        href={`https://instagram.com/${entry.instagram.replace("@", "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="radar-link"
                      >
                        <i
                          className="fa-brands fa-instagram"
                          aria-hidden="true"
                        />
                        {entry.instagram.startsWith("@")
                          ? entry.instagram
                          : `@${entry.instagram}`}
                      </a>
                    )}
                    {entry.instagram && (
                      <span className="radar-link-divider">|</span>
                    )}
                    <span className="radar-link-type">
                      {TYPE_LABELS[entry.type] || entry.type || "Community"}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default IgClassRadarPage;

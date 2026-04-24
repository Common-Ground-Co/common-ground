// Studios listing page with sidebar filters and horizontal card layout.
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Navigation from "../components/Navigation.jsx";
import { fetchStudios } from "../services/studiosService.js";
import "../css/StudiosPage.css";

const DANCE_STYLES = [
  "Hip-Hop",
  "Open",
  "K-Pop",
  "Heels",
  "Wacking",
  "Vouge",
  "Jazz",
  "Contemporary",
  "Ballet",
];
const SKILL_LEVELS = [
  "Beginner Friendly",
  "All Levels",
  "Intermediate",
  "Advanced",
];

function getStartingPrice(priceRange) {
  const [min] = String(priceRange || "").split("-");
  const parsedMin = Number(min.replace("$", "").trim());
  return Number.isFinite(parsedMin) ? parsedMin : Number.POSITIVE_INFINITY;
}

function StudiosPage() {
  const [searchParams] = useSearchParams();
  const [studios, setStudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [selectedLevels, setSelectedLevels] = useState([]);

  const searchQuery = (searchParams.get("search") || "").trim().toLowerCase();

  useEffect(() => {
    const loadStudios = async () => {
      try {
        setLoading(true);
        const data = await fetchStudios();
        setStudios(data);
      } catch (err) {
        setError(err.message || "Unable to load studios");
      } finally {
        setLoading(false);
      }
    };
    loadStudios();
  }, []);

  const filteredStudios = useMemo(() => {
    let result = studios;
    if (searchQuery) {
      result = result.filter((studio) =>
        studio.name.toLowerCase().includes(searchQuery),
      );
    }
    if (selectedStyles.length > 0) {
      result = result.filter((studio) => {
        const studioStyles = (studio.style || "")
          .split(",")
          .map((s) => s.trim());
        return selectedStyles.some((style) =>
          studioStyles.some((s) =>
            s.toLowerCase().includes(style.toLowerCase()),
          ),
        );
      });
    }
    if (selectedLevels.length > 0) {
      result = result.filter((studio) => {
        const studioNote = (studio.best_for || "").toLowerCase();
        return selectedLevels.some((level) =>
          studioNote.includes(level.toLowerCase()),
        );
      });
    }
    return [...result].sort(
      (a, b) =>
        getStartingPrice(a.price_range) - getStartingPrice(b.price_range),
    );
  }, [studios, searchQuery, selectedStyles, selectedLevels]);

  const toggleStyleFilter = (style) => {
    setSelectedStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style],
    );
  };

  const toggleLevelFilter = (level) => {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level],
    );
  };

  const clearFilters = () => {
    setSelectedStyles([]);
    setSelectedLevels([]);
  };

  return (
    <div className="studios-page">
      <Navigation />

      {/* studios-container: invisible layout box only — no background */}
      <main className="studios-container">
        {/* studios-inner: holds the cream background + fade mask */}
        <div className="studios-inner">
          <section className="studios-header">
            <h1>Dance Studios</h1>
            {searchQuery && (
              <p className="search-hint">Results for "{searchQuery}"</p>
            )}
          </section>

          <div className="studios-layout">
            {/* Sidebar Filters */}
            <aside className="studios-sidebar">
              <div className="filter-group">
                <h3>Dance Style</h3>
                <div className="filter-pills">
                  {DANCE_STYLES.map((style) => (
                    <button
                      key={style}
                      className={`filter-pill ${
                        selectedStyles.includes(style) ? "active" : ""
                      }`}
                      onClick={() => toggleStyleFilter(style)}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <h3>Skill Level</h3>
                <div className="filter-pills">
                  {SKILL_LEVELS.map((level) => (
                    <button
                      key={level}
                      className={`filter-pill ${
                        selectedLevels.includes(level) ? "active" : ""
                      }`}
                      onClick={() => toggleLevelFilter(level)}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {(selectedStyles.length > 0 || selectedLevels.length > 0) && (
                <button className="clear-filters-btn" onClick={clearFilters}>
                  Clear All Filters
                </button>
              )}
            </aside>

            {/* Main Content */}
            <div className="studios-content">
              {loading ? (
                <div className="status-block">
                  <p>Loading studios...</p>
                </div>
              ) : error ? (
                <div className="status-block error">
                  <p>{error}</p>
                </div>
              ) : filteredStudios.length === 0 ? (
                <div className="status-block">
                  <p>No studios matched your filters.</p>
                </div>
              ) : (
                <>
                  <div className="results-header">
                    <h2>
                      Studios{" "}
                      <span className="result-count">
                        ({filteredStudios.length})
                      </span>
                    </h2>
                  </div>

                  <div className="studios-grid">
                    {filteredStudios.map((studio) => (
                      <article
                        key={studio.id}
                        className="studio-card-horizontal"
                      >
                        <div className="card-image">
                          <img
                            src={studio.photo_url}
                            alt={studio.name}
                            loading="lazy"
                          />
                        </div>
                        <div className="card-content">
                          <div className="card-header">
                            <h3>{studio.name}</h3>
                            {studio.work_study && (
                              <span className="badge work-study-badge">
                                Work Study Available
                              </span>
                            )}
                          </div>
                          <div className="card-meta">
                            <div className="meta-item">
                              <i
                                className="fa-solid fa-location-dot"
                                aria-hidden="true"
                              />
                              <span>{studio.neighborhood || "Chicago"}</span>
                            </div>
                            <div className="meta-item">
                              <i
                                className="fa-solid fa-tag"
                                aria-hidden="true"
                              />
                              <span>
                                {studio.price_range || "Price on request"}
                              </span>
                            </div>
                          </div>
                          {studio.style && (
                            <div className="card-styles">
                              {studio.style.split(",").map((s, idx) => (
                                <span key={idx} className="style-pill">
                                  {s.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                          <Link
                            to={`/studios/${studio.id}`}
                            className="view-studio-btn"
                          >
                            View Studio
                            <i
                              className="fa-solid fa-arrow-right"
                              aria-hidden="true"
                            />
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default StudiosPage;

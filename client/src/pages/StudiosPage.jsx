// Studios listing page with sidebar filters and horizontal studio cards.
import { useEffect, useMemo, useRef, useState } from "react";
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
const SKILL_LEVELS = ["Beginner Friendly", "Intermediate", "Advanced"];

function getStartingPrice(priceRange) {
  const [min] = String(priceRange || "").split("-");
  const parsedMin = Number(min.replace("$", "").trim());
  return Number.isFinite(parsedMin) ? parsedMin : Number.POSITIVE_INFINITY;
}

// Individual studio card with per-card pill overflow detection and toggle.
function StudioCard({ studio }) {
  const pillsRef = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const stylePills = studio.style
    ? studio.style
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  useEffect(() => {
    const el = pillsRef.current;
    if (el) {
      // Check if the pill container is taller than 2 rows (the clamped height).
      setIsOverflowing(el.scrollHeight > el.clientHeight + 2);
    }
  }, []);

  return (
    <article className="studio-card-horizontal">
      <div className="card-image">
        <img src={studio.photo_url} alt={studio.name} loading="lazy" />
      </div>
      <div className="card-content">
        <div className="card-header">
          <h3>{studio.name}</h3>
          {studio.work_study && (
            <span className="badge work-study-badge">Work Study</span>
          )}
        </div>
        <div className="card-meta">
          <div className="meta-item">
            <i className="fa-solid fa-location-dot" aria-hidden="true" />
            <span>{studio.neighborhood || "Chicago"}</span>
          </div>
          <div className="meta-item">
            <i className="fa-solid fa-tag" aria-hidden="true" />
            <span>{studio.price_range || "Price on request"}</span>
          </div>
        </div>
        {stylePills.length > 0 && (
          <div className="card-styles-wrap">
            <div
              ref={pillsRef}
              className={`card-styles${expanded ? "" : " card-styles--clamped"}`}
            >
              {stylePills.map((pill, idx) => (
                <span key={idx} className="style-pill">
                  {pill}
                </span>
              ))}
            </div>
            {isOverflowing && (
              <button
                type="button"
                className="card-styles-toggle"
                onClick={() => setExpanded((e) => !e)}
              >
                {expanded ? "Show less" : "Show more"}
              </button>
            )}
          </div>
        )}
        <Link to={`/studios/${studio.id}`} className="view-studio-btn">
          View Studio
          <i className="fa-solid fa-arrow-right" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
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
        const studioLevels = (studio.levels_offered || "").toLowerCase();
        return selectedLevels.some((level) =>
          studioLevels.includes(level.toLowerCase()),
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
      <div className="page-nav-wrap">
        <Navigation variant="category-strip--page" />
      </div>

      <main className="studios-container">
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
                    <StudioCard key={studio.id} studio={studio} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default StudiosPage;

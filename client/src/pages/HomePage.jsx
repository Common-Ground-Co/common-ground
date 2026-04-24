import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchStudios } from "../services/studiosService.js";
import Navigation from "../components/Navigation.jsx";
import "../css/HomePage.css";

const stylePills = [
  "Urban Choreo",
  "Hip-Hop",
  "Open Style",
  "Beginner Friendly",
  "Affordable",
  "All Ages",
];

const heroImageSrc =
  "https://images.stockcake.com/public/5/9/d/59d8fa0a-12fe-49a6-a7be-0bca48292ebf/dynamic-urban-dance-stockcake.jpg";
const polaroidImageSrc =
  "https://wallpapers.com/images/high/ballet-dance-on-the-street-bk0miq8gb70xlu7h.webp";

function HomePage() {
  const navigate = useNavigate();
  const [studios, setStudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [studioSearch, setStudioSearch] = useState("");

  useEffect(() => {
    const loadStudios = async () => {
      try {
        setLoading(true);
        const data = await fetchStudios();
        setStudios(data);
      } catch (err) {
        setError(err.message || "Unable to load featured studios");
      } finally {
        setLoading(false);
      }
    };
    loadStudios();
  }, []);

  const featuredStudios = useMemo(() => studios.slice(0, 6), [studios]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const query = studioSearch.trim();
    if (!query) {
      navigate("/studios");
      return;
    }
    navigate(`/studios?search=${encodeURIComponent(query)}`);
  };

  return (
    <main className="home-page">
      <section className="hero-banner">
        <img
          className="hero-image"
          src={heroImageSrc}
          alt="A man breakdancing."
        />
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="hero-kicker">Discover </p>
          <h1>Find Chicago Dance Studios</h1>
          <p className="hero-subtitle">
            Common Ground helps you find choreography-focused dance studios in
            Chicago — cutting through the overpriced studios, fitness classes
            and kids' programs to surface spaces that are actually built for
            adults.
          </p>
          <div className="hero-pills" aria-label="Core styles and values">
            {stylePills.map((pill) => (
              <span className="hero-pill" key={pill}>
                {pill}
              </span>
            ))}
          </div>
          <form className="hero-search-form" onSubmit={handleSearchSubmit}>
            <input
              className="hero-search-input"
              type="text"
              value={studioSearch}
              onChange={(event) => setStudioSearch(event.target.value)}
              placeholder="What dance studio are you looking for?"
              aria-label="Search studios by name"
            />
            <button className="hero-search-button" type="submit">
              <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
              <span>Search</span>
            </button>
          </form>
        </div>
        <div className="hero-polaroid" aria-hidden="true">
          <div className="hero-polaroid-frame">
            <img
              className="hero-polaroid-photo"
              src={polaroidImageSrc}
              alt=""
            />
          </div>
        </div>
      </section>

      <Navigation variant="category-strip--floating" />

      {/* featured-section: invisible layout box only, no background */}
      <section className="featured-section">
        {/* featured-inner: holds background + fade mask, no border/shadow */}
        <div className="featured-inner">
          <header className="section-heading">
            <p className="section-kicker">Curated</p>
            <h2>Featured Studios</h2>
            <p>
              Adult-friendly spaces focused on hip-hop, open style, and
              community.
            </p>
          </header>
          {loading ? (
            <p className="status-message">Loading featured studios...</p>
          ) : null}
          {error ? <p className="status-message error">{error}</p> : null}
          {!loading && !error ? (
            <div className="featured-grid">
              {featuredStudios.map((studio) => (
                <Link
                  className="featured-card"
                  to={`/studios/${studio.id}`}
                  key={studio.id}
                >
                  <img
                    src={studio.photo_url}
                    alt={studio.name}
                    loading="lazy"
                  />
                  <div className="featured-card-overlay" />
                  <div className="featured-card-content">
                    <h3>{studio.name}</h3>
                    <p>{studio.neighborhood || "Chicago"}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}

export default HomePage;

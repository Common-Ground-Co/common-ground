import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchStudios } from "../services/studiosService.js";
import Navigation from "../components/Navigation.jsx";
import "../css/HomePage.css";

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
      {/* floating nav centered at the top */}
      <div className="nav">
        <Navigation />
      </div>

      {/* single floating card: header + studio grid */}
      <div className="home-container">
        {/* top row: title/search on left, polaroid on right */}
        <div className="home-header">
          <div className="home-header-text">
            <p className="home-kicker">Discover</p>
            <h1 className="home-title">Common Ground</h1>
            <p className="home-subtitle">
              Your guide to Chicago's dance studios and classes, whether you're
              picking up your first class or looking for somewhere new to train.
            </p>
            <form className="home-search-form" onSubmit={handleSearchSubmit}>
              <input
                className="home-search-input"
                type="text"
                value={studioSearch}
                onChange={(event) => setStudioSearch(event.target.value)}
                placeholder="Search studios..."
                aria-label="Search studios by name"
              />
              <button className="home-search-button" type="submit">
                <i
                  className="fa-solid fa-magnifying-glass"
                  aria-hidden="true"
                />
              </button>
            </form>
          </div>

          <div className="home-polaroid" aria-hidden="true">
            <div className="home-polaroid-frame">
              <img
                className="home-polaroid-photo"
                src={polaroidImageSrc}
                alt=""
              />
            </div>
          </div>
        </div>

        <div className="home-divider" />

        {/* studio grid */}
        <p className="home-studios-label">Featured Studios</p>
        {loading ? <p className="home-status">Loading studios...</p> : null}
        {error ? (
          <p className="home-status home-status--error">{error}</p>
        ) : null}
        {!loading && !error ? (
          <div className="home-studios-grid">
            {featuredStudios.map((studio) => (
              <Link
                className="featured-card"
                to={`/studios/${studio.id}`}
                key={studio.id}
              >
                <img src={studio.photo_url} alt={studio.name} loading="lazy" />
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
    </main>
  );
}

export default HomePage;

import Navigation from "../components/Navigation.jsx";
import "../css/PlaceholderPage.css";

function PlaceholderPage({ title, description }) {
  return (
    <div className="placeholder-page">
      <div className="nav">
        <Navigation />
      </div>
      <main className="placeholder-container">
        <div className="wip-banner">
          <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
          <span>This section is still being built — check back soon.</span>
        </div>
        <h1 className="placeholder-title">{title}</h1>
        <p className="placeholder-description">{description}</p>
      </main>
    </div>
  );
}

export default PlaceholderPage;

// StudioCard displays summary fields for one studio in the listing grid.
import { Link } from "react-router-dom";

function StudioCard({ studio }) {
  return (
    <article>
      <img
        src={studio.photo_url}
        alt={studio.name}
        width="100%"
        loading="lazy"
      />
      <h2>{studio.name}</h2>
      <p>Neighborhood: {studio.neighborhood || "N/A"}</p>
      <p>Style: {studio.style || "N/A"}</p>
      <p>Price Range: {studio.price_range || "N/A"}</p>
      {/* Client-side navigation to that studio's detail page. */}
      <Link to={`/studios/${studio.id}`}>View Studio</Link>
    </article>
  );
}

export default StudioCard;

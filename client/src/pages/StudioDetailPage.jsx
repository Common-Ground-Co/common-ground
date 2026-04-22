// Studio detail page: fetches one studio by route param and displays its fields.
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchStudioById } from "../services/studiosService.js";

function StudioDetailPage() {
  const { id } = useParams();
  const [studio, setStudio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStudio = async () => {
      try {
        setLoading(true);
        const data = await fetchStudioById(id);
        setStudio(data);
      } catch (err) {
        setError(err.message || "Unable to load studio");
      } finally {
        setLoading(false);
      }
    };

    loadStudio();
  }, [id]);

  if (loading) {
    return (
      <main>
        <p>Loading studio...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <p>{error}</p>
      </main>
    );
  }

  if (!studio) {
    return (
      <main>
        <p>Studio not found.</p>
      </main>
    );
  }

  const fieldsToDisplay = Object.entries(studio).filter(
    // Hide internal fields that should not be shown in the public UI.
    ([key]) => key !== "approved" && key !== "id",
  );

  const formatLabel = (key) => {
    // Converts snake_case keys like work_study_url into Work Study Url.
    return key
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  };

  const formatValue = (key, value) => {
    if (value === null || value === undefined || value === "") {
      return "N/A";
    }

    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }

    if (key === "created_at") {
      // Present DB timestamps in the user's local date/time format.
      return new Date(value).toLocaleString();
    }

    return String(value);
  };

  return (
    <main>
      <h1>{studio.name}</h1>
      {studio.photo_url ? (
        <img src={studio.photo_url} alt={studio.name} width="480" />
      ) : null}

      <dl>
        {fieldsToDisplay.map(([key, value]) => (
          <div key={key}>
            <dt>{formatLabel(key)}</dt>
            <dd>{formatValue(key, value)}</dd>
          </div>
        ))}
      </dl>

      <p>
        <Link to="/studios">Back to studios</Link>
      </p>
    </main>
  );
}

export default StudioDetailPage;

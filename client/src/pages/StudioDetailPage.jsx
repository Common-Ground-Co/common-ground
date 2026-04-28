import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  createStudioReview,
  deleteStudioReview,
  fetchReviewsByStudio,
  fetchStudioById,
  updateStudioReview,
} from "../services/studiosService.js";
import Navigation from "../components/Navigation.jsx";
import "../css/StudioDetailPage.css";

function StudioDetailPage() {
  const { id } = useParams();
  const [studio, setStudio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activePhoto, setActivePhoto] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState("");
  const [reviewsNotice, setReviewsNotice] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editingReviewForm, setEditingReviewForm] = useState({
    name: "",
    rating: 5,
    description: "",
  });
  const [reviewForm, setReviewForm] = useState({
    name: "",
    rating: 5,
    description: "",
  });

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

  useEffect(() => {
    if (!reviewsNotice) return undefined;
    const timeoutId = setTimeout(() => {
      setReviewsNotice("");
    }, 2500);
    return () => clearTimeout(timeoutId);
  }, [reviewsNotice]);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        setReviewsLoading(true);
        setReviewsError("");
        const data = await fetchReviewsByStudio(id);
        setReviews(data);
      } catch (err) {
        setReviewsError(err.message || "Unable to load reviews");
      } finally {
        setReviewsLoading(false);
      }
    };

    loadReviews();
  }, [id]);

  const handleReviewChange = (event) => {
    const { name, value } = event.target;
    setReviewForm((previous) => ({
      ...previous,
      [name]: name === "rating" ? Number(value) : value,
    }));
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    if (!reviewForm.description.trim()) return;

    try {
      setSubmittingReview(true);
      setReviewsError("");
      const created = await createStudioReview({
        studioId: id,
        name: reviewForm.name,
        rating: reviewForm.rating,
        description: reviewForm.description,
      });
      setReviews((previous) => [created, ...previous]);
      setReviewsNotice("Review posted.");
      setReviewForm({
        name: "",
        rating: 5,
        description: "",
      });
    } catch (err) {
      setReviewsError(err.message || "Unable to submit your review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      setReviewsError("");
      await deleteStudioReview(reviewId);
      setReviews((previous) => previous.filter((review) => review.id !== reviewId));
      setReviewsNotice("Review deleted.");
    } catch (err) {
      setReviewsError(err.message || "Unable to delete your review");
    }
  };

  const startEditingReview = (review) => {
    setEditingReviewId(review.id);
    setEditingReviewForm({
      name: review.name || "",
      rating: review.rating || 5,
      description: review.description || "",
    });
  };

  const cancelEditingReview = () => {
    setEditingReviewId(null);
    setEditingReviewForm({
      name: "",
      rating: 5,
      description: "",
    });
  };

  const handleEditingReviewChange = (event) => {
    const { name, value } = event.target;
    setEditingReviewForm((previous) => ({
      ...previous,
      [name]: name === "rating" ? Number(value) : value,
    }));
  };

  const handleEditReviewSubmit = async (event, reviewId) => {
    event.preventDefault();
    if (!editingReviewForm.description.trim()) return;

    try {
      setReviewsError("");
      const updated = await updateStudioReview(reviewId, editingReviewForm);
      const updatedWithMeta = {
        ...updated,
        updated_at: new Date().toISOString(),
      };
      setReviews((previous) =>
        previous.map((review) => (review.id === reviewId ? updatedWithMeta : review)),
      );
      setReviewsNotice("Review updated.");
      cancelEditingReview();
    } catch (err) {
      setReviewsError(err.message || "Unable to update your review");
    }
  };

  if (loading) {
    return (
      <div className="studio-detail-page">
        <Navigation />
        <p className="detail-status">Loading studio...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="studio-detail-page">
        <Navigation />
        <p className="detail-status error">{error}</p>
      </div>
    );
  }

  if (!studio) {
    return (
      <div className="studio-detail-page">
        <Navigation />
        <p className="detail-status">Studio not found.</p>
      </div>
    );
  }

  // Build photo gallery from both photo fields
  const photos = [
    studio.photo_url,
    studio.photo_url_studio_space,
    ...(Array.isArray(studio.photos) ? studio.photos : []),
  ].filter(Boolean);

  const styleTags = studio.style
    ? studio.style
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="studio-detail-page">
      {/* Hero banner — same structure as HomePage */}
      <section className="detail-hero">
        <img
          className="detail-hero-image"
          src={
            photos[0] ||
            "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1400&q=80"
          }
          alt={studio.name}
        />
        <div className="detail-hero-overlay" />
        <div className="detail-hero-content">
          <p className="detail-hero-kicker">Dance Studio</p>
          <h1>{studio.name}</h1>
          {studio.neighborhood && (
            <p className="detail-hero-location">
              <i className="fa-solid fa-location-dot" aria-hidden="true" />
              {studio.neighborhood}, Chicago
            </p>
          )}
          {styleTags.length > 0 && (
            <div className="detail-hero-pills">
              {styleTags.map((tag) => (
                <span className="hero-pill" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        {/* Decorative polaroid — second photo if available */}
        {photos[1] && (
          <div className="hero-polaroid" aria-hidden="true">
            <div className="hero-polaroid-frame">
              <img className="hero-polaroid-photo" src={photos[1]} alt="" />
            </div>
          </div>
        )}
      </section>

      <Navigation variant="category-strip--floating" />

      <div className="detail-body">
        {/* ── Left sidebar: Class Details card ── */}
        <aside className="detail-sidebar">
          <div className="detail-info-card">
            <h2 className="info-card-title">Class Details</h2>
            <div className="info-card-divider" />

            {studio.address && (
              <div className="info-row">
                <span className="info-label">
                  <i className="fa-solid fa-location-dot" /> Location
                </span>
                <span className="info-value">{studio.address}</span>
              </div>
            )}

            {studio.price_range && (
              <div className="info-row">
                <span className="info-label">
                  <i className="fa-solid fa-tag" /> Pricing
                </span>
                <span className="info-value">{studio.price_range}</span>
              </div>
            )}

            {studio.website && (
              <div className="info-row">
                <span className="info-label">
                  <i className="fa-solid fa-globe" /> Website
                </span>
                <a
                  className="info-link"
                  href={studio.website}
                  target="_blank"
                  rel="noreferrer"
                >
                  Visit site
                </a>
              </div>
            )}

            {studio.instagram && (
              <div className="info-row">
                <span className="info-label">
                  <i className="fa-brands fa-instagram" /> IG Handle
                </span>
                <a
                  className="info-link"
                  href={`https://instagram.com/${studio.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {studio.instagram.startsWith("@")
                    ? studio.instagram
                    : `@${studio.instagram}`}
                </a>
              </div>
            )}

            {studio.schedule_url && (
              <div className="info-row">
                <span className="info-label">
                  <i className="fa-regular fa-calendar-days" /> Schedule
                </span>
                <a
                  className="info-link"
                  href={studio.schedule_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  View schedule
                </a>
              </div>
            )}

            {studio.classpass && (
              <div className="info-row">
                <span className="info-label">
                  <i className="fa-solid fa-credit-card" /> ClassPass
                </span>
                <span className="info-value info-badge">Accepted</span>
              </div>
            )}

            {studio.work_study && (
              <div className="info-row">
                <span className="info-label">
                  <i className="fa-solid fa-hands-helping" /> Work Study
                </span>
                {studio.work_study_url ? (
                  <a
                    className="info-link"
                    href={studio.work_study_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Available
                  </a>
                ) : (
                  <span className="info-value info-badge">Available</span>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="detail-main">
          {/* Photo gallery */}
          {photos.length > 1 && (
            <section className="detail-gallery">
              <div className="gallery-main">
                <img
                  src={photos[activePhoto]}
                  alt={`${studio.name} photo ${activePhoto + 1}`}
                />
              </div>
              <div className="gallery-thumbs">
                {photos.map((photo, i) => (
                  <button
                    key={i}
                    className={`gallery-thumb ${activePhoto === i ? "active" : ""}`}
                    onClick={() => setActivePhoto(i)}
                    aria-label={`View photo ${i + 1}`}
                  >
                    <img src={photo} alt="" />
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* About section */}
          {studio.curator_review && (
            <section className="detail-section">
              <div className="section-label">
                <span className="section-accent-line" />
                <h3>About the Studio</h3>
              </div>
              <p className="detail-description">{studio.curator_review}</p>
            </section>
          )}

          {/* Best for */}
          {studio.best_for && (
            <section className="detail-section">
              <div className="section-label">
                <span className="section-accent-line" />
                <h3>Best For</h3>
              </div>
              <p className="detail-description">{studio.best_for}</p>
            </section>
          )}

          {/* Pricing breakdown */}
          {studio.price_range && (
            <section className="detail-section">
              <div className="section-label">
                <span className="section-accent-line" />
                <h3>Pricing</h3>
              </div>
              <div className="pricing-grid">
                <div className="pricing-card">
                  <i className="fa-solid fa-ticket" />
                  <span className="pricing-label">Drop-in</span>
                  <span className="pricing-value">{studio.price_range}</span>
                </div>
                {studio.classpass && (
                  <div className="pricing-card">
                    <i className="fa-solid fa-credit-card" />
                    <span className="pricing-label">ClassPass</span>
                    <span className="pricing-value">Accepted</span>
                  </div>
                )}
                {studio.work_study && (
                  <div className="pricing-card pricing-card--accent">
                    <i className="fa-solid fa-star" />
                    <span className="pricing-label">Work Study</span>
                    <span className="pricing-value">Available</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Curator's take */}
          {studio.curator_review && (
            <section className="detail-section curator-section">
              <div className="curator-quote">
                <i
                  className="fa-solid fa-quote-left curator-quote-icon"
                  aria-hidden="true"
                />
                <blockquote>{studio.curator_review}</blockquote>
                <p className="curator-sig">— Common Ground curator</p>
              </div>
            </section>
          )}

          {/* CTA buttons */}
          <div className="detail-ctas">
            {studio.schedule_url && (
              <a
                href={studio.schedule_url}
                target="_blank"
                rel="noreferrer"
                className="cta-btn cta-btn--primary"
              >
                <i className="fa-regular fa-calendar-days" />
                View Full Schedule
              </a>
            )}
            {studio.website && (
              <a
                href={studio.website}
                target="_blank"
                rel="noreferrer"
                className="cta-btn cta-btn--secondary"
              >
                <i className="fa-solid fa-arrow-up-right-from-square" />
                Studio Website
              </a>
            )}
          </div>
        </main>
      </div>

      {/* Reviews section */}
      <section className="detail-reviews">
        <div className="reviews-inner">
          <h2 className="reviews-title">
            Reviews <i className="fa-solid fa-star" aria-hidden="true" />
          </h2>
          <div className="reviews-divider" />
          <form className="review-form" onSubmit={handleReviewSubmit}>
            <div className="review-form-row">
              <label className="review-label" htmlFor="review-name">
                Name (optional)
              </label>
              <input
                id="review-name"
                name="name"
                value={reviewForm.name}
                onChange={handleReviewChange}
                className="review-input"
                placeholder="Anonymous"
                maxLength={40}
              />
            </div>
            <div className="review-form-row">
              <label className="review-label" htmlFor="review-rating">
                Rating
              </label>
              <select
                id="review-rating"
                name="rating"
                value={reviewForm.rating}
                onChange={handleReviewChange}
                className="review-input"
              >
                <option value={5}>5 - Loved it</option>
                <option value={4}>4 - Great</option>
                <option value={3}>3 - Good</option>
                <option value={2}>2 - Okay</option>
                <option value={1}>1 - Not for me</option>
              </select>
            </div>
            <div className="review-form-row">
              <label className="review-label" htmlFor="review-description">
                Your review
              </label>
              <textarea
                id="review-description"
                name="description"
                value={reviewForm.description}
                onChange={handleReviewChange}
                className="review-textarea"
                rows={4}
                placeholder="Share your experience..."
                required
              />
            </div>
            <button
              type="submit"
              className="review-submit-btn"
              disabled={submittingReview}
            >
              {submittingReview ? "Posting..." : "Post review"}
            </button>
          </form>

          {reviewsError && <p className="reviews-error">{reviewsError}</p>}
          {reviewsNotice && <p className="reviews-notice">{reviewsNotice}</p>}

          {reviewsLoading ? (
            <p className="reviews-empty">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="reviews-empty">
              No reviews yet — be the first to share your experience.
            </p>
          ) : (
            <div className="review-list">
              {reviews.map((review) => (
                <article key={review.id} className="review-card">
                  {editingReviewId === review.id ? (
                    <form
                      className="review-edit-form"
                      onSubmit={(event) => handleEditReviewSubmit(event, review.id)}
                    >
                      <div className="review-form-row">
                        <label className="review-label" htmlFor={`edit-name-${review.id}`}>
                          Name (optional)
                        </label>
                        <input
                          id={`edit-name-${review.id}`}
                          name="name"
                          value={editingReviewForm.name}
                          onChange={handleEditingReviewChange}
                          className="review-input"
                          placeholder="Anonymous"
                          maxLength={40}
                        />
                      </div>
                      <div className="review-form-row">
                        <label className="review-label" htmlFor={`edit-rating-${review.id}`}>
                          Rating
                        </label>
                        <select
                          id={`edit-rating-${review.id}`}
                          name="rating"
                          value={editingReviewForm.rating}
                          onChange={handleEditingReviewChange}
                          className="review-input"
                        >
                          <option value={5}>5 - Loved it</option>
                          <option value={4}>4 - Great</option>
                          <option value={3}>3 - Good</option>
                          <option value={2}>2 - Okay</option>
                          <option value={1}>1 - Not for me</option>
                        </select>
                      </div>
                      <div className="review-form-row">
                        <label className="review-label" htmlFor={`edit-description-${review.id}`}>
                          Your review
                        </label>
                        <textarea
                          id={`edit-description-${review.id}`}
                          name="description"
                          value={editingReviewForm.description}
                          onChange={handleEditingReviewChange}
                          className="review-textarea"
                          rows={3}
                          required
                        />
                      </div>
                      <div className="review-actions">
                        <button type="submit" className="review-action-btn review-action-btn--save">
                          Save
                        </button>
                        <button
                          type="button"
                          className="review-action-btn review-action-btn--cancel"
                          onClick={cancelEditingReview}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="review-card-head">
                        <p className="review-author">{review.name || "Anonymous"}</p>
                        <p className="review-rating" aria-label={`${review.rating} out of 5`}>
                          {"★".repeat(review.rating)}
                          {"☆".repeat(5 - review.rating)}
                        </p>
                      </div>
                      <p className="review-description">{review.description}</p>
                      {review.updated_at && (
                        <p className="review-edited">Edited</p>
                      )}
                      {review.can_edit && (
                        <div className="review-actions">
                          <button
                            type="button"
                            className="review-action-btn review-action-btn--edit"
                            onClick={() => startEditingReview(review)}
                          >
                            Edit my review
                          </button>
                          <button
                            type="button"
                            className="review-action-btn review-action-btn--delete"
                            onClick={() => handleDeleteReview(review.id)}
                          >
                            Delete my review
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="detail-back">
        <Link to="/studios" className="back-link">
          <i className="fa-solid fa-arrow-left" /> Back to Studios
        </Link>
      </div>
    </div>
  );
}

export default StudioDetailPage;

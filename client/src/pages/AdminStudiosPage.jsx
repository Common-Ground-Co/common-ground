import { useEffect, useState } from "react";
import Navigation from "../components/Navigation.jsx";
import {
  adminFetchStudios,
  adminCreateStudio,
  adminUpdateStudio,
  adminDeleteStudio,
} from "../services/adminStudiosService.js";
import "../css/AdminStudiosPage.css";

const EMPTY_FORM = {
  name: "",
  neighborhood: "",
  address: "",
  website: "",
  schedule_url: "",
  instagram: "",
  style: "",
  levels_offered: "",
  price_range: "",
  classpass: false,
  photo_url: "",
  photo_url_studio_space: "",
  polaroid_photo_url: "",
  about_studio: "",
  banner_photo_url: "",
  curator_review: "",
  best_for: "",
  work_study: false,
  work_study_url: "",
  approved: false,
};

function AdminStudiosPage() {
  const [studios, setStudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudio, setEditingStudio] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    loadStudios();
  }, []);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 3000);
    return () => clearTimeout(t);
  }, [notice]);

  async function loadStudios() {
    try {
      setLoading(true);
      setError("");
      const data = await adminFetchStudios();
      setStudios(data);
    } catch (err) {
      setError(err.message || "Failed to load studios");
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setEditingStudio(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  }

  function openEditModal(studio) {
    setEditingStudio(studio);
    setForm({
      name: studio.name || "",
      neighborhood: studio.neighborhood || "",
      address: studio.address || "",
      website: studio.website || "",
      schedule_url: studio.schedule_url || "",
      instagram: studio.instagram || "",
      style: studio.style || "",
      levels_offered: studio.levels_offered || "",
      price_range: studio.price_range || "",
      classpass: studio.classpass ?? false,
      photo_url: studio.photo_url || "",
      photo_url_studio_space: studio.photo_url_studio_space || "",
      polaroid_photo_url: studio.polaroid_photo_url || "",
      about_studio: studio.about_studio || "",
      banner_photo_url: studio.banner_photo_url || "",
      curator_review: studio.curator_review || "",
      best_for: studio.best_for || "",
      work_study: studio.work_study ?? false,
      work_study_url: studio.work_study_url || "",
      approved: studio.approved ?? false,
    });
    setFormError("");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingStudio(null);
    setForm(EMPTY_FORM);
    setFormError("");
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    const payload = {
      ...form,
      classpass: Boolean(form.classpass),
      work_study: Boolean(form.work_study),
      approved: Boolean(form.approved),
    };

    try {
      if (editingStudio) {
        const updated = await adminUpdateStudio(editingStudio.id, payload);
        setStudios((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        setNotice(`"${updated.name}" updated.`);
      } else {
        const created = await adminCreateStudio(payload);
        setStudios((prev) => [...prev, created]);
        setNotice(`"${created.name}" added.`);
      }
      closeModal();
    } catch (err) {
      setFormError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    try {
      await adminDeleteStudio(id);
      const deleted = studios.find((s) => s.id === id);
      setStudios((prev) => prev.filter((s) => s.id !== id));
      setNotice(`"${deleted?.name}" deleted.`);
    } catch (err) {
      setError(err.message || "Failed to delete studio");
    } finally {
      setConfirmDeleteId(null);
    }
  }

  return (
    <div className="admin-page">
      <Navigation />

      <div className="admin-inner">
        <div className="admin-header">
          <div>
            <p className="admin-kicker">Content Management</p>
            <h1 className="admin-title">Studios</h1>
          </div>
          <button className="admin-add-btn" onClick={openAddModal}>
            <i className="fa-solid fa-plus" /> Add Studio
          </button>
        </div>

        {notice && <p className="admin-notice">{notice}</p>}
        {error && <p className="admin-error">{error}</p>}

        {loading ? (
          <p className="admin-status">Loading studios...</p>
        ) : studios.length === 0 ? (
          <p className="admin-status">No studios found.</p>
        ) : (
          <div className="admin-studio-list">
            {studios.map((studio) => (
              <div key={studio.id} className="admin-studio-row">
                <div className="admin-studio-thumb">
                  {studio.photo_url ? (
                    <img src={studio.photo_url} alt={studio.name} />
                  ) : (
                    <div className="admin-studio-thumb-placeholder">
                      <i className="fa-solid fa-image" />
                    </div>
                  )}
                </div>
                <div className="admin-studio-meta">
                  <p className="admin-studio-name">{studio.name}</p>
                  <p className="admin-studio-sub">
                    {studio.neighborhood || "—"} &middot; {studio.price_range || "—"}
                  </p>
                  <div className="admin-studio-badges">
                    <span className={`admin-badge ${studio.approved ? "admin-badge--green" : "admin-badge--muted"}`}>
                      {studio.approved ? "Approved" : "Not approved"}
                    </span>
                    {studio.classpass && <span className="admin-badge admin-badge--muted">ClassPass</span>}
                    {studio.work_study && <span className="admin-badge admin-badge--muted">Work Study</span>}
                  </div>
                </div>
                <div className="admin-studio-actions">
                  <button
                    className="admin-action-btn admin-action-btn--edit"
                    onClick={() => openEditModal(studio)}
                  >
                    <i className="fa-solid fa-pen" /> Edit
                  </button>
                  <button
                    className="admin-action-btn admin-action-btn--delete"
                    onClick={() => setConfirmDeleteId(studio.id)}
                  >
                    <i className="fa-solid fa-trash" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      {modalOpen && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-head">
              <h2>{editingStudio ? `Edit — ${editingStudio.name}` : "Add Studio"}</h2>
              <button className="admin-modal-close" onClick={closeModal} aria-label="Close">
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <form className="admin-form" onSubmit={handleSubmit}>
              <div className="admin-form-section-label">Basic Info</div>

              <div className="admin-form-row">
                <label className="admin-label" htmlFor="name">Studio Name</label>
                <input id="name" name="name" className="admin-input" value={form.name} onChange={handleChange} required />
              </div>

              <div className="admin-form-grid">
                <div className="admin-form-row">
                  <label className="admin-label" htmlFor="neighborhood">Neighborhood</label>
                  <input id="neighborhood" name="neighborhood" className="admin-input" value={form.neighborhood} onChange={handleChange} required />
                </div>
                <div className="admin-form-row">
                  <label className="admin-label" htmlFor="address">Address</label>
                  <input id="address" name="address" className="admin-input" value={form.address} onChange={handleChange} required />
                </div>
              </div>

              <div className="admin-form-grid">
                <div className="admin-form-row">
                  <label className="admin-label" htmlFor="website">Website URL</label>
                  <input id="website" name="website" className="admin-input" value={form.website} onChange={handleChange} required />
                </div>
                <div className="admin-form-row">
                  <label className="admin-label" htmlFor="schedule_url">Schedule URL</label>
                  <input id="schedule_url" name="schedule_url" className="admin-input" value={form.schedule_url} onChange={handleChange} required />
                </div>
              </div>

              <div className="admin-form-grid">
                <div className="admin-form-row">
                  <label className="admin-label" htmlFor="instagram">Instagram Handle</label>
                  <input id="instagram" name="instagram" className="admin-input" placeholder="@handle" value={form.instagram} onChange={handleChange} required />
                </div>
                <div className="admin-form-row">
                  <label className="admin-label" htmlFor="price_range">Price Range</label>
                  <input id="price_range" name="price_range" className="admin-input" placeholder="$15–$20 per class" value={form.price_range} onChange={handleChange} required />
                </div>
              </div>

              <div className="admin-form-row">
                <label className="admin-label" htmlFor="style">Dance Styles (comma-separated)</label>
                <input id="style" name="style" className="admin-input" placeholder="Hip-Hop, Jazz, Contemporary" value={form.style} onChange={handleChange} required />
              </div>

              <div className="admin-form-row">
                <label className="admin-label" htmlFor="levels_offered">Levels Offered</label>
                <input id="levels_offered" name="levels_offered" className="admin-input" placeholder="Beginner Friendly, Intermediate, Advanced" value={form.levels_offered} onChange={handleChange} required />
              </div>

              <div className="admin-form-section-label">Photos</div>

              <div className="admin-form-row">
                <label className="admin-label" htmlFor="photo_url">Main Photo URL</label>
                <input id="photo_url" name="photo_url" className="admin-input" value={form.photo_url} onChange={handleChange} required />
              </div>
              <div className="admin-form-row">
                <label className="admin-label" htmlFor="photo_url_studio_space">Studio Space Photo URL</label>
                <input id="photo_url_studio_space" name="photo_url_studio_space" className="admin-input" value={form.photo_url_studio_space} onChange={handleChange} required />
              </div>
              <div className="admin-form-row">
                <label className="admin-label" htmlFor="polaroid_photo_url">Polaroid Photo URL</label>
                <input id="polaroid_photo_url" name="polaroid_photo_url" className="admin-input" value={form.polaroid_photo_url} onChange={handleChange} required />
              </div>
              <div className="admin-form-row">
                <label className="admin-label" htmlFor="banner_photo_url">Banner Photo URL</label>
                <input id="banner_photo_url" name="banner_photo_url" className="admin-input" value={form.banner_photo_url} onChange={handleChange} required />
              </div>

              <div className="admin-form-section-label">Content</div>

              <div className="admin-form-row">
                <label className="admin-label" htmlFor="about_studio">About the Studio</label>
                <textarea id="about_studio" name="about_studio" className="admin-textarea" rows={4} value={form.about_studio} onChange={handleChange} required />
              </div>
              <div className="admin-form-row">
                <label className="admin-label" htmlFor="curator_review">Curator Review</label>
                <textarea id="curator_review" name="curator_review" className="admin-textarea" rows={4} value={form.curator_review} onChange={handleChange} required />
              </div>
              <div className="admin-form-row">
                <label className="admin-label" htmlFor="best_for">Best For</label>
                <textarea id="best_for" name="best_for" className="admin-textarea" rows={3} value={form.best_for} onChange={handleChange} required />
              </div>

              <div className="admin-form-section-label">Options</div>

              <div className="admin-form-grid">
                <div className="admin-form-row">
                  <label className="admin-label" htmlFor="work_study_url">Work Study URL / Email</label>
                  <input id="work_study_url" name="work_study_url" className="admin-input" value={form.work_study_url} onChange={handleChange} required />
                </div>
              </div>

              <div className="admin-checkboxes">
                <label className="admin-checkbox-label">
                  <input type="checkbox" name="classpass" checked={form.classpass} onChange={handleChange} />
                  ClassPass accepted
                </label>
                <label className="admin-checkbox-label">
                  <input type="checkbox" name="work_study" checked={form.work_study} onChange={handleChange} />
                  Work Study available
                </label>
                <label className="admin-checkbox-label">
                  <input type="checkbox" name="approved" checked={form.approved} onChange={handleChange} />
                  Approved (visible on site)
                </label>
              </div>

              {formError && <p className="admin-form-error">{formError}</p>}

              <div className="admin-form-footer">
                <button type="submit" className="admin-submit-btn" disabled={submitting}>
                  {submitting ? "Saving..." : editingStudio ? "Save Changes" : "Add Studio"}
                </button>
                <button type="button" className="admin-cancel-btn" onClick={closeModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation ── */}
      {confirmDeleteId !== null && (
        <div className="admin-modal-overlay" onClick={() => setConfirmDeleteId(null)}>
          <div className="admin-confirm" onClick={(e) => e.stopPropagation()}>
            <p className="admin-confirm-text">
              Delete <strong>{studios.find((s) => s.id === confirmDeleteId)?.name}</strong>? This cannot be undone.
            </p>
            <div className="admin-confirm-actions">
              <button
                className="admin-action-btn admin-action-btn--delete"
                onClick={() => handleDelete(confirmDeleteId)}
              >
                Yes, delete
              </button>
              <button
                className="admin-action-btn admin-action-btn--edit"
                onClick={() => setConfirmDeleteId(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminStudiosPage;

// Reviews controller: performs database queries for review resources.
import pool from "../config/database.js";

export const getReviewsByStudio = async (req, res) => {
  try {
    const { studio_id } = req.query;
    const reviewToken = req.get("x-review-token") || "";
    // If studio_id is provided, filter reviews for that studio only.
    const result = studio_id
      ? await pool.query(
          `SELECT id, studio_id, name, rating, description, created_at,
                  CASE WHEN email = $2 THEN true ELSE false END AS can_edit
           FROM reviews
           WHERE studio_id = $1
           ORDER BY created_at DESC`,
          [studio_id, reviewToken],
        )
      : await pool.query(
          `SELECT id, studio_id, name, rating, description, created_at,
                  CASE WHEN email = $1 THEN true ELSE false END AS can_edit
           FROM reviews
           ORDER BY created_at DESC`,
          [reviewToken],
        );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
};

export const createReview = async (req, res) => {
  try {
    const { studio_id, name, email, rating, description } = req.body;
    if (!studio_id || !rating || !description) {
      return res.status(400).json({
        error: "studio_id, rating, and description are required",
      });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }
    const displayName = name?.trim() || "Anonymous";
    const result = await pool.query(
      `INSERT INTO reviews (studio_id, name, email, rating, description)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [studio_id, displayName, email || null, rating, description],
    );
    res.status(201).json({
      id: result.rows[0].id,
      studio_id: result.rows[0].studio_id,
      name: result.rows[0].name,
      rating: result.rows[0].rating,
      description: result.rows[0].description,
      created_at: result.rows[0].created_at,
      can_edit: true,
    });
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ error: "Failed to create review" });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const reviewToken = req.get("x-review-token") || "";
    const { name, email, rating, description } = req.body;
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }
    if (!reviewToken) {
      return res.status(401).json({ error: "Missing review token" });
    }
    // Only update fields that were actually provided in the request body.
    const result = await pool.query(
      `UPDATE reviews
       SET
         name        = COALESCE($1, name),
         email       = COALESCE($2, email),
         rating      = COALESCE($3, rating),
         description = COALESCE($4, description)
       WHERE id = $5 AND email = $6
       RETURNING *`,
      [name || null, email || null, rating || null, description || null, id, reviewToken],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Review not found or not yours" });
    }
    res.status(200).json({
      id: result.rows[0].id,
      studio_id: result.rows[0].studio_id,
      name: result.rows[0].name,
      rating: result.rows[0].rating,
      description: result.rows[0].description,
      created_at: result.rows[0].created_at,
      can_edit: true,
    });
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ error: "Failed to update review" });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const reviewToken = req.get("x-review-token") || "";
    if (!reviewToken) {
      return res.status(401).json({ error: "Missing review token" });
    }
    const result = await pool.query(
      "DELETE FROM reviews WHERE id = $1 AND email = $2 RETURNING id",
      [id, reviewToken],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Review not found or not yours" });
    }
    res.status(200).json({ message: "Review deleted", id: result.rows[0].id });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ error: "Failed to delete review" });
  }
};

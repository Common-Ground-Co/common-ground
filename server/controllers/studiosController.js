// Studios controller: performs database queries for studio resources.
import pool from "../config/database.js";

export const getAllStudios = async (req, res) => {
  try {
    // Ordered results give stable listing behavior in the UI.
    const result = await pool.query("SELECT * FROM studios ORDER BY id ASC");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching studios:", error);
    res.status(500).json({ error: "Failed to fetch studios" });
  }
};

export const getStudioById = async (req, res) => {
  try {
    const { id } = req.params;
    // Explicit column list controls the response shape and intentionally excludes fields we do not want exposed.
    const result = await pool.query(
      `SELECT
         id,
         name,
         neighborhood,
         address,
         website,
         schedule_url,
         instagram,
         style,
         price_range,
         classpass,
         photo_url,
         photo_url_studio_space,
         curator_review,
         best_for,
         work_study,
         work_study_url,
         created_at
       FROM studios
       WHERE id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Studio not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching studio:", error);
    res.status(500).json({ error: "Failed to fetch studio" });
  }
};

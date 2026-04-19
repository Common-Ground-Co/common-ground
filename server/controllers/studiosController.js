import pool from "../config/database.js";

export const getAllStudios = async (req, res) => {
  try {
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
    const result = await pool.query("SELECT * FROM studios WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Studio not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching studio:", error);
    res.status(500).json({ error: "Failed to fetch studio" });
  }
};

// IG Accounts controller: performs database queries for ig_accounts resources.
import pool from "../config/database.js";

export const getAllIgAccounts = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM ig_accounts ORDER BY id ASC",
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching IG accounts:", error);
    res.status(500).json({ error: "Failed to fetch IG accounts" });
  }
};

export const getIgAccountById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT
         id,
         name,
         instagram,
         description,
         type,
         photo_url,
         created_at
       FROM ig_accounts
       WHERE id = $1`,
      [id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "IG account not found" });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching IG account:", error);
    res.status(500).json({ error: "Failed to fetch IG account" });
  }
};

import { writeFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import pool from "../config/database.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const STUDIOS_JSON_PATH = join(__dirname, "../data/studios.json");

async function syncStudiosJson() {
  try {
    const { rows } = await pool.query("SELECT * FROM studios ORDER BY id ASC");
    await writeFile(STUDIOS_JSON_PATH, JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error("Failed to sync studios.json:", err);
  }
}

const EDITABLE_FIELDS = [
  "name",
  "neighborhood",
  "address",
  "website",
  "schedule_url",
  "instagram",
  "style",
  "levels_offered",
  "price_range",
  "classpass",
  "photo_url",
  "photo_url_studio_space",
  "polaroid_photo_url",
  "about_studio",
  "banner_photo_url",
  "curator_review",
  "best_for",
  "work_study",
  "work_study_url",
  "approved",
];

export const getAllStudiosAdmin = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM studios ORDER BY id ASC"
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching studios:", error);
    res.status(500).json({ error: "Failed to fetch studios" });
  }
};

const getMissingFields = (body) =>
  EDITABLE_FIELDS.filter((f) => body[f] === undefined || body[f] === null || body[f] === "");

export const createStudio = async (req, res) => {
  try {
    const missing = getMissingFields(req.body);
    if (missing.length > 0) {
      return res.status(400).json({ error: "Missing required fields", fields: missing });
    }

    const values = EDITABLE_FIELDS.map((f) => req.body[f]);
    const cols = EDITABLE_FIELDS.join(", ");
    const placeholders = EDITABLE_FIELDS.map((_, i) => `$${i + 1}`).join(", ");

    const result = await pool.query(
      `INSERT INTO studios (${cols}) VALUES (${placeholders}) RETURNING *`,
      values
    );

    await syncStudiosJson();
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating studio:", error);
    res.status(500).json({ error: "Failed to create studio" });
  }
};

export const updateStudio = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = EDITABLE_FIELDS.filter((f) => req.body[f] !== undefined);

    if (fields.length === 0) {
      return res.status(400).json({ error: "No valid fields provided" });
    }

    const setClauses = fields.map((f, i) => `${f} = $${i + 1}`).join(", ");
    const values = fields.map((f) => req.body[f]);

    const result = await pool.query(
      `UPDATE studios SET ${setClauses} WHERE id = $${fields.length + 1} RETURNING *`,
      [...values, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Studio not found" });
    }

    await syncStudiosJson();
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error updating studio:", error);
    res.status(500).json({ error: "Failed to update studio" });
  }
};

export const deleteStudio = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM studios WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Studio not found" });
    }

    await syncStudiosJson();
    res.status(200).json({ message: "Studio deleted", id: result.rows[0].id });
  } catch (error) {
    console.error("Error deleting studio:", error);
    res.status(500).json({ error: "Failed to delete studio" });
  }
};

// Classes router: returns class schedule rows joined with studio metadata.
import { Router } from "express";
import pool from "../config/database.js";

const classesRouter = Router();

// GET /api/classes
classesRouter.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         c.id,
         c.name,
         c.skill_level,
         c.day_of_week,
         c.class_date,
         c.start_time,
         s.name AS studio_name,
         s.photo_url AS studio_photo_url,
         s.schedule_url AS studio_schedule_url
       FROM classes c
       JOIN studios s ON s.id = c.studio_id
       ORDER BY c.class_date ASC, c.start_time ASC`,
    );

    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Unable to fetch classes" });
  }
});

export default classesRouter;

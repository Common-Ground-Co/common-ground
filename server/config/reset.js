// Reset script: rebuilds tables from schema and seeds initial dataset.
import pool from "./database.js";
import { schema } from "./schema.js";
import studios from "../data/studios.js";
import communityRadar from "../data/communityRadar.js";

const seedStudios = async () => {
  for (const studio of studios) {
    // Parameterized INSERT keeps values safely escaped and mapped in a fixed order.
    await pool.query(
      `INSERT INTO studios 
        (name, neighborhood, address, website, schedule_url, instagram, style, price_range, classpass, photo_url, photo_url_studio_space, curator_review, best_for, work_study, work_study_url, approved)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
      [
        studio.name,
        studio.neighborhood,
        studio.address,
        studio.website,
        studio.schedule_url,
        studio.instagram,
        studio.style,
        studio.price_range,
        studio.classpass,
        studio.photo_url,
        studio.photo_url_studio_space,
        studio.curator_review,
        studio.best_for,
        studio.work_study,
        studio.work_study_url,
        studio.approved,
      ],
    );
    console.log(`✅ ${studio.name} added`);
  }
};

const seedCommunityRadar = async () => {
  for (const entry of communityRadar) {
    // Each source object becomes one row in community_radar.
    await pool.query(
      `INSERT INTO community_radar 
        (name, instagram, description, type, photo_url)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        entry.name,
        entry.instagram,
        entry.description,
        entry.type,
        entry.photo_url,
      ],
    );
    console.log(`✅ ${entry.name} added`);
  }
};

const reset = async () => {
  try {
    // Runs DROP/CREATE statements before loading fresh seed data.
    await pool.query(schema);
    console.log("🎉 tables created successfully");
    await seedStudios();
    await seedCommunityRadar();
    console.log("🌱 seed complete");
  } catch (err) {
    console.error("⚠️ error during reset", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

reset();

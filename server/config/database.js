// Database client setup: creates a shared pg Pool for all server queries.
import pg from "pg";
import dotenv from "dotenv";
dotenv.config();
const { Pool } = pg;

const pool = new Pool({
  // These values come from .env so credentials are not hardcoded.
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  // Required for hosted Postgres providers that enforce TLS.
  ssl: { rejectUnauthorized: false },
});

export default pool;

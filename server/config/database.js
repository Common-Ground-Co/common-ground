import pg from "pg";
import dotenv from "dotenv";
dotenv.config();
// pg is shorthand for postgresSQL
const { Pool } = pg;

const pool = new Pool({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  ssl: { rejectUnauthorized: false },
});

export default pool;

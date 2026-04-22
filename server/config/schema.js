// SQL schema used by the reset script to recreate all core tables.
export const schema = `
  DROP TABLE IF EXISTS reviews;
  DROP TABLE IF EXISTS classes;
  DROP TABLE IF EXISTS studios;
  DROP TABLE IF EXISTS studio_submissions;
  DROP TABLE IF EXISTS community_radar;

  CREATE TABLE studios (
    id             SERIAL PRIMARY KEY,
    name           TEXT NOT NULL,
    neighborhood   TEXT,
    address        TEXT,
    website        TEXT,
    schedule_url   TEXT,
    instagram      TEXT,
    style          TEXT,
    price_range    TEXT,
    classpass      BOOLEAN DEFAULT false,
    photo_url      TEXT,
    photo_url_studio_space TEXT DEFAULT NULL,
    curator_review TEXT,
    best_for       TEXT,
    work_study     BOOLEAN DEFAULT false,
    work_study_url    TEXT,
    approved       BOOLEAN DEFAULT false,
    created_at     TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE classes (
    id          SERIAL PRIMARY KEY,
    studio_id   INTEGER REFERENCES studios(id),
    name        TEXT NOT NULL,
    instructor  TEXT,
    style       TEXT,
    skill_level TEXT,
    day_of_week TEXT,
    class_date  DATE,
    start_time  TIME,
    end_time    TIME,
    price       INTEGER,
    booking_url TEXT,
    created_at  TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE reviews (
    id          SERIAL PRIMARY KEY,
    studio_id   INTEGER REFERENCES studios(id),
    name        TEXT NOT NULL,
    email       TEXT,
    rating      INTEGER,
    description TEXT,
    created_at  TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE studio_submissions (
    id            SERIAL PRIMARY KEY,
    name          TEXT NOT NULL,
    neighborhood  TEXT,
    address       TEXT,
    website       TEXT,
    instagram     TEXT,
    style         TEXT,
    price_range   TEXT,
    classpass     BOOLEAN DEFAULT false,
    contact_email TEXT,
    message       TEXT,
    status        TEXT DEFAULT 'pending',
    created_at    TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE community_radar (
    id          SERIAL PRIMARY KEY,
    name        TEXT NOT NULL,
    instagram   TEXT,
    description TEXT,
    type        TEXT,
    photo_url   TEXT,
    created_at  TIMESTAMP DEFAULT NOW()
  );
`;

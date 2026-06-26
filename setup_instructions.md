## Running Locally

### Prerequisites

Make sure you have the following installed before starting:

- [Node.js](https://nodejs.org/) (v18 or later)
- A PostgreSQL database - I use Render

## Render Setup

If connecting to a Render-hosted database:

1. Create a free account at [render.com](https://render.com)
2. Create a new **PostgreSQL** database instance
3. From the database info page, copy the connection values into your `.env` file
4. Here is where to find your environment variables on Render: [Example Image](https://i.imgur.com/BSpFnLS.png)

---

### 1. Clone the repo

```bash
git clone <repo-url>
cd common-ground
```

---

### 2. Set up environment variables

The backend needs a `.env` file to connect to your database. Create one inside the `server/` folder:

```bash
touch server/.env
```

Then open it and add your database credentials:

```
PGUSER=your_db_username
PGPASSWORD=your_db_password
PGHOST=your_db_host
PGPORT=5432
PGDATABASE=your_db_name
```

---

### 3. Install dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

---

### 4. Set up the database

From inside the `server/` folder, run the reset script. This creates all the tables and seeds the initial studio and IG account data:

```bash
cd server
npm run reset
```

You should see output like `✅ Visceral Dance Center added` for each studio.

---

### 5. Start the backend

From the `server/` folder:

```bash
npm run start
```

The server runs on **http://localhost:3000**. It will auto-restart when you save changes (nodemon).

---

### 6. Start the frontend

```bash
npm run dev
```

The app will be available at **http://localhost:5173**. API requests are automatically forwarded to the backend.

---

### 7. (Optional) Run the scrapers

The scrapers pull live class schedules from each studio's website and save them to your database.

Run all scrapers:

```bash
cd server
npm run scrape
```

Run a single scraper by name:

```bash
npm run scrape -- puzzlebox
npm run scrape -- visceral
npm run scrape -- indiemedia
npm run scrape -- danceforever
```

---

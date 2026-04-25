// Express app entrypoint: loads middleware, mounts API routes, and starts the server.
import express from "express";
import dotenv from "dotenv";
import studiosRouter from "./routes/studios.js";
import classesRouter from "./routes/classes.js";
import igAccountsRouter from "./routes/igAccounts.js";
import reviewsRouter from "./routes/reviews.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// All API endpoints are namespaced under /api.
app.use("/api/studios", studiosRouter);
app.use("/api/classes", classesRouter);
app.use("/api/ig-accounts", igAccountsRouter);
app.use("/api/reviews", reviewsRouter);

app.get("/", (req, res) => {
  res.send("Common Ground API is running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

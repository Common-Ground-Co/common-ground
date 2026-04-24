// Express app entrypoint: loads middleware, mounts API routes, and starts the server.
import express from "express";
import dotenv from "dotenv";
import studiosRouter from "./routes/studios.js";
import classesRouter from "./routes/classes.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
// All studio-related API endpoints are namespaced under /api/studios.
app.use("/api/studios", studiosRouter);
app.use("/api/classes", classesRouter);

app.get("/", (req, res) => {
  res.send("Common Ground API is running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

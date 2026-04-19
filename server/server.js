import express from "express";
import dotenv from "dotenv";
import studiosRouter from "./routes/studios.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/studios", studiosRouter);

app.get("/", (req, res) => {
  res.send("Common Ground API is running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

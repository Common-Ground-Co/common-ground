// Studios router: maps HTTP endpoints to controller handlers.
import { Router } from "express";
import {
  getAllStudios,
  getStudioById,
} from "../controllers/studiosController.js";

const studiosRouter = Router();

// GET /api/studios
studiosRouter.get("/", getAllStudios);

// GET /api/studios/:id
studiosRouter.get("/:id", getStudioById);

export default studiosRouter;

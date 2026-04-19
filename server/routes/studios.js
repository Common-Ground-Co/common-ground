import { Router } from "express";
import {
  getAllStudios,
  getStudioById,
} from "../controllers/studiosController.js";

const studiosRouter = Router();

studiosRouter.get("/", getAllStudios);

studiosRouter.get("/:id", getStudioById);

export default studiosRouter;

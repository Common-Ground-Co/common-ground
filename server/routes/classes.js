// Classes router: maps HTTP endpoints to controller handlers.
import { Router } from "express";
import { getAllClasses } from "../controllers/classesController.js";

const classesRouter = Router();

// GET /api/classes
classesRouter.get("/", getAllClasses);

export default classesRouter;

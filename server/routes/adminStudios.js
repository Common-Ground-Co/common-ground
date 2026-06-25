import { Router } from "express";
import {
  getAllStudiosAdmin,
  createStudio,
  updateStudio,
  deleteStudio,
} from "../controllers/adminStudiosController.js";

const adminStudiosRouter = Router();

// GET /admin/studios
adminStudiosRouter.get("/", getAllStudiosAdmin);

// POST /admin/studios
adminStudiosRouter.post("/", createStudio);

// PUT /admin/studios/:id
adminStudiosRouter.put("/:id", updateStudio);

// DELETE /admin/studios/:id
adminStudiosRouter.delete("/:id", deleteStudio);

export default adminStudiosRouter;

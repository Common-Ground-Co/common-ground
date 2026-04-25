// IG Accounts router: maps HTTP endpoints to controller handlers.
import { Router } from "express";
import {
  getAllIgAccounts,
  getIgAccountById,
} from "../controllers/igAccountsController.js";

const igAccountsRouter = Router();

// GET /api/ig-accounts
igAccountsRouter.get("/", getAllIgAccounts);

// GET /api/ig-accounts/:id
igAccountsRouter.get("/:id", getIgAccountById);

export default igAccountsRouter;

// Reviews router: maps HTTP endpoints to controller handlers.
import { Router } from "express";
import {
  getReviewsByStudio,
  createReview,
  updateReview,
  deleteReview,
} from "../controllers/reviewsController.js";

const reviewsRouter = Router();

// GET /api/reviews?studio_id=1  (or /api/reviews for all)
reviewsRouter.get("/", getReviewsByStudio);

// POST /api/reviews
reviewsRouter.post("/", createReview);

// PUT /api/reviews/:id
reviewsRouter.put("/:id", updateReview);

// DELETE /api/reviews/:id
reviewsRouter.delete("/:id", deleteReview);

export default reviewsRouter;

import express from "express";
import {
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  addReview
} from "../Controllers/MenuController.js";
import { protect } from "../Middleware/auth.js"; // Import protect middleware

const router = express.Router();

// Public routes
router.route('/')
  .get(getMenuItems)
  .post(createMenuItem);

router.route('/:id')
  .get(getMenuItem)
  .put(updateMenuItem)
  .delete(deleteMenuItem);

// Protected route for students to add reviews
router.route('/:id/reviews')
  .post(protect, addReview); // Only authenticated students can post reviews

export default router;
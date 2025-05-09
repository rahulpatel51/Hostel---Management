import express from "express"
import {
  createMess,
  getAllMesses,
  getMessById,
  updateMess,
  addFeedback,
  updateMessMenu,
  deleteMess,
} from "../Controllers/MessController.js"
import { protect, authorize } from "../Middleware/auth.js"

const router = express.Router()

// Protect all routes
router.use(protect)

// Routes accessible by all authenticated users
router.get("/", getAllMesses)
router.get("/:id", getMessById)
router.post("/:id/feedback", addFeedback)

// Routes for admin
router.post("/", authorize("admin"), createMess)
router.put("/:id", authorize("admin"), updateMess)
router.delete("/:id", authorize("admin"), deleteMess)

// Routes for admin and warden
router.put("/:id/menu", authorize("admin", "warden"), updateMessMenu)

export default router

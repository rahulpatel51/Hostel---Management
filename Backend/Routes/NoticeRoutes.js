import express from "express"
import {
  createNotice,
  getAllNotices,
  getNoticeById,
  updateNotice,
  deleteNotice,
} from "../Controllers/noticeController.js"
import { protect, authorize } from "../Middleware/auth.js"

const router = express.Router()

// Protect all routes
router.use(protect)

// Routes accessible by all authenticated users
router.get("/", getAllNotices)
router.get("/:id", getNoticeById)

// Routes for admin and warden
router.post("/", authorize("admin", "warden"), createNotice)
router.put("/:id", authorize("admin", "warden"), updateNotice)
router.delete("/:id", authorize("admin", "warden"), deleteNotice)

export default router

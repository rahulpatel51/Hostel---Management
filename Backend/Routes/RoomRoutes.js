import express from "express"
import {
  createRoom,
  getAllRooms,
  getRoomById,
  updateRoom,
  assignStudentToRoom,
  removeStudentFromRoom,
} from "../Controllers/RoomController.js"
import { protect, authorize } from "../Middleware/auth.js"

const router = express.Router()

// Protect all routes
router.use(protect)

// Admin-only routes
router.post("/", authorize("admin"), createRoom)
router.put("/:id", authorize("admin"), updateRoom)

// Admin and warden routes
router.get("/", authorize("admin", "warden"), getAllRooms)
router.get("/:id", authorize("admin", "warden"), getRoomById)
router.post("/:id/assign", authorize("admin", "warden"), assignStudentToRoom)
router.post("/:id/remove", authorize("admin", "warden"), removeStudentFromRoom)

export default router

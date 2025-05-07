import express from "express"
import {
  createRoom,
  getAllRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  assignStudentToRoom,
  removeStudentFromRoom,
} from "../Controllers/RoomController.js"
import { protect, authorize } from "../Middleware/auth.js"

const router = express.Router()

router.get("/", getAllRooms)
router.get("/:id", getRoomById)
router.delete("/:id", deleteRoom);


// Protect all routes (user must be authenticated)
router.use(protect)

// Routes accessible by both admin and warden
router.post("/",  createRoom)
router.put("/:id",  updateRoom)

export default router

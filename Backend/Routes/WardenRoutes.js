import express from "express"
import {
  getProfile,
  updateProfile,
  getStudents,
  getRooms,
  getComplaints,
  updateComplaintStatus,
  getLeaveApplications,
  updateLeaveStatus,
  markAttendance,
  getAttendanceByDate,
  createDisciplinaryRecord,
  getDisciplinaryRecords,
  updateDisciplinaryStatus,
  createNotice,
  getNotices,
  updateMessMenu,
  getMessDetails,
} from "../Controllers/WardenController.js"
import { protect, authorize } from "../Middleware/auth.js"

const router = express.Router()

// Protect all routes
router.use(protect)
router.use(authorize("warden"))

// Profile routes
router.get("/profile", getProfile)
router.put("/profile", updateProfile)

// Student routes
router.get("/students", getStudents)

// Room routes
router.get("/rooms", getRooms)

// Complaint routes
router.get("/complaints", getComplaints)
router.put("/complaints/:id", updateComplaintStatus)

// Leave routes
router.get("/leave", getLeaveApplications)
router.put("/leave/:id", updateLeaveStatus)

// Attendance routes
router.post("/attendance", markAttendance)
router.get("/attendance/:date", getAttendanceByDate)

// Discipline routes
router.post("/discipline", createDisciplinaryRecord)
router.get("/discipline", getDisciplinaryRecords)
router.put("/discipline/:id", updateDisciplinaryStatus)

// Notice routes
router.post("/notices", createNotice)
router.get("/notices", getNotices)

// Mess routes
router.put("/mess/menu", updateMessMenu)
router.get("/mess/:id", getMessDetails)

export default router

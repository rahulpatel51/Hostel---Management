import express from "express"
import {
  getProfile,
  updateProfile,
  submitComplaint,
  getComplaints,
  getComplaintById,
  addCommentToComplaint,
  applyForLeave,
  getLeaveApplications,
  getLeaveApplicationById,
  cancelLeaveApplication,
  getFeeDetails,
  getAttendanceRecords,
} from "../Controllers/StudentController.js"
import { protect, authorize } from "../Middleware/auth.js"

const router = express.Router()

// Protect all routes
router.use(protect)
router.use(authorize("student"))

// Profile routes
router.get("/profile", getProfile)
router.put("/profile", updateProfile)

// Complaint routes
router.post("/complaints", submitComplaint)
router.get("/complaints", getComplaints)
router.get("/complaints/:id", getComplaintById)
router.post("/complaints/:id/comments", addCommentToComplaint)

// Leave routes
router.post("/leave", applyForLeave)
router.get("/leave", getLeaveApplications)
router.get("/leave/:id", getLeaveApplicationById)
router.put("/leave/:id/cancel", cancelLeaveApplication)

// Fee routes
router.get("/fees", getFeeDetails)

// Attendance routes
router.get("/attendance", getAttendanceRecords)

export default router

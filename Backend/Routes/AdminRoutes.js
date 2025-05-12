import express from "express"
import {
  createStudent,
  deleteStudent,
  createWarden,
  getAllStudents,
  getAllWardens,
  getStudentById,
  getWardenById,
  updateStudent,
  updateWarden,
  deleteWarden,
  deactivateUser,
  activateUser,
  resetUserPassword,
  generateReport,
  getAllReports,
  getReportById,
  markAttendance,
  getAttendanceByDate,
  getAttendanceDates,
  getAllComplaints,
  updateComplaintByAdmin,
  // addCommentToComplaint,
  // getComplaintById,
  getLeaveApplications,
  updateLeaveStatus,
} from "../Controllers/AdminController.js"
import { protect, authorize } from "../Middleware/auth.js"

const router = express.Router()

// Protect all routes
router.use(protect)
router.use(authorize("admin"))

// Student routes
router.post("/students", createStudent)
router.get("/students", getAllStudents)
router.get("/students/:id", getStudentById)
router.put("/students/:id", updateStudent)
router.delete("/students/:id", deleteStudent);

// Warden routes
router.post("/wardens", createWarden)
router.get("/wardens", getAllWardens)
router.get("/wardens/:id", getWardenById)
router.put("/wardens/:id", updateWarden)
router.delete("/wardens/:id", deleteWarden) 


// User management routes
router.put("/users/:id/deactivate", deactivateUser)
router.put("/users/:id/activate", activateUser)
router.put("/users/:id/reset-password", resetUserPassword)

// Report routes
router.post("/reports", generateReport)
router.get("/reports", getAllReports)
router.get("/reports/:id", getReportById)

// Attendance routes
// Mark attendance (bulk operation)
router.post('/attendance', markAttendance);

// Complaint routes
router.get("/complaints", getAllComplaints)
router.put("/complaints/:id", updateComplaintByAdmin)
// router.post("/complaints/:id/comments", addCommentToComplaint)
// router.get("/complaints/:id", getComplaintById)

// Get attendance by date
router.get('/attendance/:date', getAttendanceByDate);

// Leave routes
router.get("/leave", getLeaveApplications)
router.put("/leave/:id", updateLeaveStatus)

// Get all unique dates with attendance records
router.get('/attendance/dates/all', getAttendanceDates); // FIRST
router.get('/:date', getAttendanceByDate);    // THEN


export default router

import Student from "../Models/Student.js"
import Complaint from "../Models/Complaint.js"
import Leave from "../Models/Leave.js"
import Fee from "../Models/Fee.js"
import Attendance from "../Models/Attendance.js"
import { uploadMultipleImages } from "../Config/cloudinary.js"

// Get student profile
export const getProfile = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user.id }).populate("roomId").populate("disciplinaryRecords")

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      })
    }

    res.status(200).json({
      success: true,
      data: student,
    })
  } catch (error) {
    next(error)
  }
}

// Update student profile
export const updateProfile = async (req, res, next) => {
  try {
    const { contactNumber, address } = req.body

    // Find student
    const student = await Student.findOne({ userId: req.user.id })

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      })
    }

    // Update student
    const updatedStudent = await Student.findByIdAndUpdate(
      student._id,
      {
        contactNumber,
        address,
      },
      { new: true, runValidators: true },
    )

    res.status(200).json({
      success: true,
      data: updatedStudent,
    })
  } catch (error) {
    next(error)
  }
}

// Submit complaint
export const submitComplaint = async (req, res, next) => {
  try {
    const { title, description, category, priority, roomNumber } = req.body

    // Find student
    const student = await Student.findOne({ userId: req.user.id })

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      })
    }

    // Upload images if provided
    let images = []
    if (req.body.images && req.body.images.length > 0) {
      images = await uploadMultipleImages(req.body.images, `hostel_management/complaints/${student._id}`)
    }

    // Create complaint
    const complaint = await Complaint.create({
      title,
      description,
      category,
      priority,
      submittedBy: req.user.id,
      roomNumber: roomNumber || (student.roomId ? student.roomId.roomNumber : ""),
      images,
    })

    res.status(201).json({
      success: true,
      data: complaint,
    })
  } catch (error) {
    next(error)
  }
}

// Get all complaints by student
export const getComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({ submittedBy: req.user.id }).sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints,
    })
  } catch (error) {
    next(error)
  }
}

// Get complaint by ID
export const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findOne({
      _id: req.params.id,
      submittedBy: req.user.id,
    }).populate({
      path: "assignedTo",
      select: "username",
    })

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      })
    }

    res.status(200).json({
      success: true,
      data: complaint,
    })
  } catch (error) {
    next(error)
  }
}

// Add comment to complaint
export const addCommentToComplaint = async (req, res, next) => {
  try {
    const { text } = req.body

    // Find complaint
    const complaint = await Complaint.findOne({
      _id: req.params.id,
      submittedBy: req.user.id,
    })

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      })
    }

    // Add comment
    complaint.comments.push({
      text,
      user: req.user.id,
    })

    await complaint.save()

    res.status(200).json({
      success: true,
      data: complaint,
    })
  } catch (error) {
    next(error)
  }
}

// Apply for leave
export const applyForLeave = async (req, res, next) => {
  try {
    const { leaveType, startDate, endDate, reason, destination, contactDuringLeave, parentApproval } = req.body

    // Find student
    const student = await Student.findOne({ userId: req.user.id })

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      })
    }

    // Upload documents if provided
    let documents = []
    if (req.body.documents && req.body.documents.length > 0) {
      documents = await uploadMultipleImages(req.body.documents, `hostel_management/leave/${student._id}`)
    }

    // Create leave application
    const leave = await Leave.create({
      student: student._id,
      leaveType,
      startDate,
      endDate,
      reason,
      destination,
      contactDuringLeave,
      parentApproval,
      documents,
    })

    res.status(201).json({
      success: true,
      data: leave,
    })
  } catch (error) {
    next(error)
  }
}

// Get all leave applications by student
export const getLeaveApplications = async (req, res, next) => {
  try {
    // Find student
    const student = await Student.findOne({ userId: req.user.id })

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      })
    }

    const leaves = await Leave.find({ student: student._id })
      .populate({
        path: "approvedBy",
        select: "username",
      })
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves,
    })
  } catch (error) {
    next(error)
  }
}

// Get leave application by ID
export const getLeaveApplicationById = async (req, res, next) => {
  try {
    // Find student
    const student = await Student.findOne({ userId: req.user.id })

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      })
    }

    const leave = await Leave.findOne({
      _id: req.params.id,
      student: student._id,
    }).populate({
      path: "approvedBy",
      select: "username",
    })

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave application not found",
      })
    }

    res.status(200).json({
      success: true,
      data: leave,
    })
  } catch (error) {
    next(error)
  }
}

// Cancel leave application
export const cancelLeaveApplication = async (req, res, next) => {
  try {
    // Find student
    const student = await Student.findOne({ userId: req.user.id })

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      })
    }

    // Find leave application
    const leave = await Leave.findOne({
      _id: req.params.id,
      student: student._id,
      status: "pending",
    })

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave application not found or cannot be cancelled",
      })
    }

    // Update leave status
    leave.status = "cancelled"
    await leave.save()

    res.status(200).json({
      success: true,
      data: leave,
    })
  } catch (error) {
    next(error)
  }
}

// Get fee details
export const getFeeDetails = async (req, res, next) => {
  try {
    // Find student
    const student = await Student.findOne({ userId: req.user.id })

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      })
    }

    const fees = await Fee.find({ student: student._id }).sort({ dueDate: -1 })

    res.status(200).json({
      success: true,
      count: fees.length,
      data: fees,
    })
  } catch (error) {
    next(error)
  }
}

// Get attendance records
export const getAttendanceRecords = async (req, res, next) => {
  try {
    // Find student
    const student = await Student.findOne({ userId: req.user.id })

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      })
    }

    // Get date range from query params
    const { startDate, endDate } = req.query
    const query = { student: student._id }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    }

    const attendance = await Attendance.find(query).sort({ date: -1 })

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance,
    })
  } catch (error) {
    next(error)
  }
}

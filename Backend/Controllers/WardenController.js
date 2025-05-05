import Warden from "../Models/Warden.js"
import Student from "../Models/Student.js"
import Room from "../Models/Room.js"
import Complaint from "../Models/Complaint.js"
import Leave from "../Models/Leave.js"
import Attendance from "../Models/Attendance.js"
import Discipline from "../Models/Discipline.js"
import Notice from "../Models/Notice.js"
import Mess from "../Models/Mess.js"
import { uploadMultipleImages } from "../Config/cloudinary.js"

// Get warden profile
export const getProfile = async (req, res, next) => {
  try {
    const warden = await Warden.findOne({ userId: req.user.id })

    if (!warden) {
      return res.status(404).json({
        success: false,
        message: "Warden profile not found",
      })
    }

    res.status(200).json({
      success: true,
      data: warden,
    })
  } catch (error) {
    next(error)
  }
}

// Update warden profile
export const updateProfile = async (req, res, next) => {
  try {
    const { contactNumber, address } = req.body

    // Find warden
    const warden = await Warden.findOne({ userId: req.user.id })

    if (!warden) {
      return res.status(404).json({
        success: false,
        message: "Warden profile not found",
      })
    }

    // Update warden
    const updatedWarden = await Warden.findByIdAndUpdate(
      warden._id,
      {
        contactNumber,
        address,
      },
      { new: true, runValidators: true },
    )

    res.status(200).json({
      success: true,
      data: updatedWarden,
    })
  } catch (error) {
    next(error)
  }
}

// Get all students under warden's blocks
export const getStudents = async (req, res, next) => {
  try {
    // Find warden
    const warden = await Warden.findOne({ userId: req.user.id })

    if (!warden) {
      return res.status(404).json({
        success: false,
        message: "Warden profile not found",
      })
    }

    // Get rooms in assigned blocks
    const rooms = await Room.find({
      block: { $in: warden.assignedBlocks },
    })

    const roomIds = rooms.map((room) => room._id)

    // Get students in those rooms
    const students = await Student.find({
      roomId: { $in: roomIds },
    })
      .populate({
        path: "userId",
        select: "username email profilePicture isActive",
      })
      .populate("roomId")

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    })
  } catch (error) {
    next(error)
  }
}

// Get all rooms under warden's blocks
export const getRooms = async (req, res, next) => {
  try {
    // Find warden
    const warden = await Warden.findOne({ userId: req.user.id })

    if (!warden) {
      return res.status(404).json({
        success: false,
        message: "Warden profile not found",
      })
    }

    // Get rooms in assigned blocks
    const rooms = await Room.find({
      block: { $in: warden.assignedBlocks },
    }).populate("occupants")

    res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms,
    })
  } catch (error) {
    next(error)
  }
}

// Get all complaints assigned to warden
export const getComplaints = async (req, res, next) => {
  try {
    // Find warden
    const warden = await Warden.findOne({ userId: req.user.id })

    if (!warden) {
      return res.status(404).json({
        success: false,
        message: "Warden profile not found",
      })
    }

    // Get complaints assigned to warden or from warden's blocks
    const complaints = await Complaint.find({
      $or: [
        { assignedTo: req.user.id },
        {
          roomNumber: {
            $in: (await Room.find({ block: { $in: warden.assignedBlocks } })).map((room) => room.roomNumber),
          },
        },
      ],
    })
      .populate({
        path: "submittedBy",
        select: "username",
      })
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints,
    })
  } catch (error) {
    next(error)
  }
}

// Update complaint status
export const updateComplaintStatus = async (req, res, next) => {
  try {
    const { status, remarks } = req.body

    // Find complaint
    const complaint = await Complaint.findById(req.params.id)

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      })
    }

    // Update complaint
    complaint.status = status

    // Add comment if remarks provided
    if (remarks) {
      complaint.comments.push({
        text: remarks,
        user: req.user.id,
      })
    }

    // If resolved, set resolved date
    if (status === "resolved") {
      complaint.resolvedAt = Date.now()
    }

    // If not already assigned, assign to current warden
    if (!complaint.assignedTo) {
      complaint.assignedTo = req.user.id
    }

    await complaint.save()

    res.status(200).json({
      success: true,
      data: complaint,
    })
  } catch (error) {
    next(error)
  }
}

// Get all leave applications
export const getLeaveApplications = async (req, res, next) => {
  try {
    // Find warden
    const warden = await Warden.findOne({ userId: req.user.id })

    if (!warden) {
      return res.status(404).json({
        success: false,
        message: "Warden profile not found",
      })
    }

    // Get rooms in assigned blocks
    const rooms = await Room.find({
      block: { $in: warden.assignedBlocks },
    })

    const roomIds = rooms.map((room) => room._id)

    // Get students in those rooms
    const students = await Student.find({
      roomId: { $in: roomIds },
    })

    const studentIds = students.map((student) => student._id)

    // Get leave applications from those students
    const leaves = await Leave.find({
      student: { $in: studentIds },
    })
      .populate({
        path: "student",
        select: "name rollNumber",
        populate: {
          path: "userId",
          select: "username profilePicture",
        },
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

// Update leave application status
export const updateLeaveStatus = async (req, res, next) => {
  try {
    const { status, remarks } = req.body

    // Find leave application
    const leave = await Leave.findById(req.params.id)

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave application not found",
      })
    }

    // Update leave status
    leave.status = status
    leave.remarks = remarks
    leave.approvedBy = req.user.id
    leave.approvalDate = Date.now()

    await leave.save()

    res.status(200).json({
      success: true,
      data: leave,
    })
  } catch (error) {
    next(error)
  }
}

// Mark attendance
export const markAttendance = async (req, res, next) => {
  try {
    const { studentId, date, morningStatus, eveningStatus, remarks } = req.body

    // Check if attendance already exists for this student on this date
    let attendance = await Attendance.findOne({
      student: studentId,
      date: new Date(date),
    })

    if (attendance) {
      // Update existing attendance
      attendance.morningStatus = morningStatus || attendance.morningStatus
      attendance.eveningStatus = eveningStatus || attendance.eveningStatus
      attendance.remarks = remarks || attendance.remarks
      attendance.markedBy = req.user.id
    } else {
      // Create new attendance record
      attendance = new Attendance({
        student: studentId,
        date: new Date(date),
        morningStatus,
        eveningStatus,
        remarks,
        markedBy: req.user.id,
      })
    }

    await attendance.save()

    res.status(200).json({
      success: true,
      data: attendance,
    })
  } catch (error) {
    next(error)
  }
}

// Get attendance records for a specific date
export const getAttendanceByDate = async (req, res, next) => {
  try {
    const { date } = req.params

    // Find warden
    const warden = await Warden.findOne({ userId: req.user.id })

    if (!warden) {
      return res.status(404).json({
        success: false,
        message: "Warden profile not found",
      })
    }

    // Get rooms in assigned blocks
    const rooms = await Room.find({
      block: { $in: warden.assignedBlocks },
    })

    const roomIds = rooms.map((room) => room._id)

    // Get students in those rooms
    const students = await Student.find({
      roomId: { $in: roomIds },
    })

    const studentIds = students.map((student) => student._id)

    // Get attendance records for those students on the specified date
    const attendanceRecords = await Attendance.find({
      student: { $in: studentIds },
      date: {
        $gte: new Date(date),
        $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)),
      },
    }).populate({
      path: "student",
      select: "name rollNumber",
      populate: {
        path: "userId",
        select: "username profilePicture",
      },
    })

    res.status(200).json({
      success: true,
      count: attendanceRecords.length,
      data: attendanceRecords,
    })
  } catch (error) {
    next(error)
  }
}

// Create disciplinary record
export const createDisciplinaryRecord = async (req, res, next) => {
  try {
    const { studentId, issueType, description, witnesses, action, actionDetails, fineAmount } = req.body

    // Upload evidence if provided
    let evidence = []
    if (req.body.evidence && req.body.evidence.length > 0) {
      evidence = await uploadMultipleImages(req.body.evidence, `hostel_management/discipline/${studentId}`)
    }

    // Create disciplinary record
    const discipline = await Discipline.create({
      student: studentId,
      issueType,
      description,
      reportedBy: req.user.id,
      witnesses,
      evidence,
      action,
      actionDetails,
      fineAmount: fineAmount || 0,
    })

    // Add reference to student's disciplinary records
    await Student.findByIdAndUpdate(studentId, { $push: { disciplinaryRecords: discipline._id } })

    res.status(201).json({
      success: true,
      data: discipline,
    })
  } catch (error) {
    next(error)
  }
}

// Get all disciplinary records
export const getDisciplinaryRecords = async (req, res, next) => {
  try {
    // Find warden
    const warden = await Warden.findOne({ userId: req.user.id })

    if (!warden) {
      return res.status(404).json({
        success: false,
        message: "Warden profile not found",
      })
    }

    // Get rooms in assigned blocks
    const rooms = await Room.find({
      block: { $in: warden.assignedBlocks },
    })

    const roomIds = rooms.map((room) => room._id)

    // Get students in those rooms
    const students = await Student.find({
      roomId: { $in: roomIds },
    })

    const studentIds = students.map((student) => student._id)

    // Get disciplinary records for those students
    const disciplinaryRecords = await Discipline.find({
      student: { $in: studentIds },
    })
      .populate({
        path: "student",
        select: "name rollNumber",
        populate: {
          path: "userId",
          select: "username profilePicture",
        },
      })
      .populate({
        path: "reportedBy",
        select: "username",
      })
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: disciplinaryRecords.length,
      data: disciplinaryRecords,
    })
  } catch (error) {
    next(error)
  }
}

// Update disciplinary record status
export const updateDisciplinaryStatus = async (req, res, next) => {
  try {
    const { status, comments } = req.body

    // Find disciplinary record
    const discipline = await Discipline.findById(req.params.id)

    if (!discipline) {
      return res.status(404).json({
        success: false,
        message: "Disciplinary record not found",
      })
    }

    // Update status
    discipline.status = status

    // Add comment if provided
    if (comments) {
      discipline.comments.push({
        text: comments,
        user: req.user.id,
      })
    }

    await discipline.save()

    res.status(200).json({
      success: true,
      data: discipline,
    })
  } catch (error) {
    next(error)
  }
}

// Create notice
export const createNotice = async (req, res, next) => {
  try {
    const { title, content, category, importance, targetAudience, expiryDate } = req.body

    // Upload attachments if provided
    let attachments = []
    if (req.body.attachments && req.body.attachments.length > 0) {
      attachments = await uploadMultipleImages(req.body.attachments, `hostel_management/notices`)
    }

    // Create notice
    const notice = await Notice.create({
      title,
      content,
      category,
      importance,
      publishedBy: req.user.id,
      targetAudience,
      attachments,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
    })

    res.status(201).json({
      success: true,
      data: notice,
    })
  } catch (error) {
    next(error)
  }
}

// Get all notices
export const getNotices = async (req, res, next) => {
  try {
    const notices = await Notice.find({
      $or: [{ targetAudience: "all" }, { targetAudience: "wardens" }, { publishedBy: req.user.id }],
      isActive: true,
    })
      .populate({
        path: "publishedBy",
        select: "username",
      })
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: notices.length,
      data: notices,
    })
  } catch (error) {
    next(error)
  }
}

// Update mess menu
export const updateMessMenu = async (req, res, next) => {
  try {
    const { messId, weeklyMenu } = req.body

    // Find mess
    const mess = await Mess.findById(messId)

    if (!mess) {
      return res.status(404).json({
        success: false,
        message: "Mess not found",
      })
    }

    // Update mess menu
    mess.weeklyMenu = weeklyMenu
    await mess.save()

    res.status(200).json({
      success: true,
      data: mess,
    })
  } catch (error) {
    next(error)
  }
}

// Get mess details
export const getMessDetails = async (req, res, next) => {
  try {
    const mess = await Mess.findById(req.params.id).populate({
      path: "messManager",
      select: "username",
    })

    if (!mess) {
      return res.status(404).json({
        success: false,
        message: "Mess not found",
      })
    }

    res.status(200).json({
      success: true,
      data: mess,
    })
  } catch (error) {
    next(error)
  }
}

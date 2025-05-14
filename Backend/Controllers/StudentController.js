import Student from "../Models/Student.js"
import Room from "../Models/Room.js";
import Complaint from "../Models/Complaint.js"
import Leave from "../Models/Leave.js"
import Fee from "../Models/Fee.js"
import Attendance from "../Models/Attendance.js"
import { uploadMultipleImages } from "../Config/cloudinary.js"

// Get student profile
export const getProfile = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user.id }).populate("roomId")

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
    const { phone, address, image } = req.body;

    // Find student using user ID from token (middleware must set req.user)
    const student = await Student.findOne({ userId: req.user.id });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    // Update the fields (phone, address, image)
    const updatedStudent = await Student.findByIdAndUpdate(
      student._id,
      {
        ...(phone && { phone }),
        ...(address && { address }),
        ...(image && { image }),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedStudent,
    });
  } catch (error) {
    console.error("Update Error:", error);
    next(error);
  }
};




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
export const deleteLeaveApplication = async (req, res, next) => {
  try {
    // Find student
    const student = await Student.findOne({ userId: req.user.id });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    // Find and delete leave application
    const deletedLeave = await Leave.findOneAndDelete({
      _id: req.params.id,
      student: student._id,
      status: "pending", // Only allow deletion if it's still pending
    });

    if (!deletedLeave) {
      return res.status(404).json({
        success: false,
        message: "Leave application not found or already processed",
      });
    }

    res.status(200).json({
      success: true,
      message: "Leave application deleted successfully",
      data: deletedLeave,
    });
  } catch (error) {
    next(error);
  }
};

// Edit leave application
export const editLeaveApplication = async (req, res, next) => {
  try {
    const {
      leaveType,
      startDate,
      endDate,
      reason,
      destination,
      contactDuringLeave,
      parentApproval,
    } = req.body;

    // Find student
    const student = await Student.findOne({ userId: req.user.id });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    // Find and update leave application if it's pending
    const updatedLeave = await Leave.findOneAndUpdate(
      {
        _id: req.params.id,
        student: student._id,
        status: "pending",
      },
      {
        leaveType,
        startDate,
        endDate,
        reason,
        destination,
        contactDuringLeave,
        parentApproval,
      },
      { new: true }
    );

    if (!updatedLeave) {
      return res.status(404).json({
        success: false,
        message: "Leave application not found or already processed",
      });
    }

    res.status(200).json({
      success: true,
      message: "Leave application updated successfully",
      data: updatedLeave,
    });
  } catch (error) {
    next(error);
  }
};


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

export const getStudentWithRoomInfo = async (req, res, next) => {
  try {
    // 1. Find the student with basic info and room reference
    const student = await Student.findOne({ userId: req.user.id })
      .select('-password -__v -createdAt -updatedAt');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    // 2. If student has a room, get complete room details with all occupants
    let roomDetails = null;
    if (student.roomId) {
      roomDetails = await Room.findById(student.roomId)
        .populate({
          path: 'occupants',
          select: '_id name email phone course year image status',
          match: { status: 'Active' } // Only show active occupants
        })
        .select('-__v -createdAt -updatedAt');
    }

    // 3. Format the response
    const response = {
      success: true,
      data: {
        student: {
          _id: student._id,
          studentId: student.studentId,
          userId: student.userId,
          name: student.name,
          email: student.email,
          phone: student.phone,
          course: student.course,
          year: student.year,
          status: student.status,
          address: student.address,
          faceId: student.faceId,
          image: student.image,
          room: roomDetails ? {
            _id: roomDetails._id,
            roomId: roomDetails.roomId,
            block: roomDetails.block,
            roomNumber: roomDetails.roomNumber,
            floor: roomDetails.floor,
            capacity: roomDetails.capacity,
            occupiedCount: roomDetails.occupiedCount,
            currentOccupancy: roomDetails.currentOccupancy,
            roomType: roomDetails.roomType,
            status: roomDetails.status,
            facilities: roomDetails.facilities,
            description: roomDetails.description,
            price: roomDetails.price,
            pricePeriod: roomDetails.pricePeriod,
            imageUrl: roomDetails.imageUrl,
            occupants: roomDetails.occupants.map(occupant => ({
              _id: occupant._id,
              name: occupant.name,
              email: occupant.email,
              phone: occupant.phone,
              course: occupant.course,
              year: occupant.year,
              image: occupant.image,
              status: occupant.status
            }))
          } : null
        }
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching student with room details:", error);
    next(error);
  }
};
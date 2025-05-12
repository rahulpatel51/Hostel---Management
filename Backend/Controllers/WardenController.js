import Warden from "../Models/Warden.js"
import Student from "../Models/Student.js"
import Room from "../Models/Room.js"
import Complaint from "../Models/Complaint.js"
import Leave from "../Models/Leave.js"
import Attendance from "../Models/Attendance.js"
import Discipline from "../Models/Discipline.js"
import Notice from "../Models/Notice.js"
import Mess from "../Models/Menu.js"
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

// Create student
export const createStudent = async (req, res, next) => {
  try {
    const { name, email, password, course, year, phone, image, address } = req.body;

    // Check if email already exists in both Student and User collections
    const existingStudent = await Student.findOne({ email });
    const existingUser = await User.findOne({ email });
    if (existingStudent || existingUser) {
      return res.status(400).json({
        success: false,
        message: "User/Student with this email already exists",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Step 1: Generate studentId with 'STD' + Random 4 digits
    const generateRandomStudentId = () => {
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      return `STD${randomDigits}`;
    };

    let studentId = generateRandomStudentId();

    // Ensure studentId is unique
    while (await Student.findOne({ studentId })) {
      studentId = generateRandomStudentId();
    }

    // Step 2: Create user with studentId
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "student",
      createdBy: req.user?.id || null,
      studentId,
      address, // Save address in User (optional, if needed)
    });

    // Step 3: Generate faceId
    const faceId = `FACE${studentId}`;

    // Step 4: Create student
    const student = new Student({
      userId: user._id,
      name,
      email,
      password: hashedPassword,
      course,
      year,
      phone,
      studentId,
      faceId,
      address, // ✅ Add address to Student model
    });

    // Step 5: Upload image if provided
    if (image) {
      const imageUrl = await uploadImage(image, `hostel_management/students/${student._id}`);
      student.image = imageUrl;
      await User.findByIdAndUpdate(user._id, { profilePicture: imageUrl });
    }

    // Save student
    await student.save();

    // Send response
    res.status(201).json({
      success: true,
      message: "Student created successfully",
      data: {
        user: {
          id: user._id,
          studentId,
          name: user.name,
          email: user.email,
          role: user.role,
          address, // ✅ Add address in response
          profilePicture: student.image || null,
        },
        student: {
          id: student._id,
          studentId,
          faceId,
          name,
          email,
          course,
          year,
          phone,
          address, 
          image: student.image || null,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all students
export const getAllStudents = async (req, res, next) => {
  try {
    const students = await Student.find().select("-password").populate("userId", "name email profilePicture isActive lastLogin");

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    next(error);
  }
};

// Get student by ID
export const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id).select("-password").populate("userId", "name email profilePicture isActive lastLogin");

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

// Update student
export const updateStudent = async (req, res, next) => {
  try {
    const { name, email, password, course, year, phone, image } = req.body;
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    if (name) student.name = name;
    if (email) student.email = email;
    if (course) student.course = course;
    if (year) student.year = year;
    if (phone) student.phone = phone;

    if (password) {
      const hashed = await bcrypt.hash(password, 12);
      student.password = hashed;
    }

    if (image) {
      const uploaded = await uploadImage(image, `hostel_management/students/${student._id}`);
      student.image = uploaded;
    }

    await student.save();

    await User.findByIdAndUpdate(
      student.userId,
      {
        name: student.name,
        email: student.email,
        ...(password && { password: student.password }),
        ...(image && { profilePicture: student.image }),
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: {
        id: student._id,
        name: student.name,
        email: student.email,
        course: student.course,
        year: student.year,
        phone: student.phone,
        image: student.image,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete student
export const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    await User.findByIdAndDelete(student.userId);
    await Student.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

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

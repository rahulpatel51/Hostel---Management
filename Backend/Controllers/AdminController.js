import User from "../Models/User.js";
import Student from "../Models/Student.js";
import Warden from "../Models/Warden.js";
import Room from "../Models/Room.js";
import Report from "../Models/Report.js";
import { uploadImage } from "../Config/cloudinary.js";
import bcrypt from "bcryptjs";

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


// Create Warden Account
export const createWarden = async (req, res, next) => {
  try {
    const { name, email, password, employeeId, contactNumber, qualification, assignedBlocks, image } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already in use" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create User
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "warden",
      createdBy: req.user.id,
    });

    // Create Warden Profile
    const warden = await Warden.create({
      userId: user._id,
      name,
      email,
      employeeId,
      contactNumber,
      qualification,
      assignedBlocks,
    });

    // Upload profile picture if exists
    if (image) {
      const imageUrl = await uploadImage(image, `hostel_management/wardens/${warden._id}`);
      warden.image = imageUrl;
      await warden.save();
      await User.findByIdAndUpdate(user._id, { profilePicture: imageUrl });
    }

    res.status(201).json({
      success: true,
      message: "Warden account created successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profilePicture: user.profilePicture,
        },
        warden,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get All Wardens
export const getAllWardens = async (req, res, next) => {
  try {
    const wardens = await Warden.find().populate("userId", "name email profilePicture isActive lastLogin");

    res.status(200).json({
      success: true,
      count: wardens.length,
      data: wardens,
    });
  } catch (error) {
    next(error);
  }
};

// Get Warden by ID
export const getWardenById = async (req, res, next) => {
  try {
    const warden = await Warden.findById(req.params.id).populate("userId", "name email profilePicture isActive lastLogin");

    if (!warden) {
      return res.status(404).json({ success: false, message: "Warden not found" });
    }

    res.status(200).json({ success: true, data: warden });
  } catch (error) {
    next(error);
  }
};

// Update Warden
export const updateWarden = async (req, res, next) => {
  try {
    const { name, email, password, contactNumber, qualification, assignedBlocks, image } = req.body;

    const warden = await Warden.findById(req.params.id);
    if (!warden) {
      return res.status(404).json({ success: false, message: "Warden not found" });
    }

    // Update Warden details
    warden.name = name || warden.name;
    warden.email = email || warden.email;
    warden.contactNumber = contactNumber || warden.contactNumber;
    warden.qualification = qualification || warden.qualification;
    warden.assignedBlocks = assignedBlocks || warden.assignedBlocks;

    // Update profile picture
    if (image) {
      const imageUrl = await uploadImage(image, `hostel_management/wardens/${warden._id}`);
      warden.image = imageUrl;
    }

    await warden.save();

    // Update linked User
    const updateUserPayload = {
      name: warden.name,
      email: warden.email,
      profilePicture: warden.image,
    };

    // Update password if provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 12);
      updateUserPayload.password = hashedPassword;
    }

    await User.findByIdAndUpdate(warden.userId, updateUserPayload, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Warden updated successfully",
      data: warden,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteWarden = async (req, res) => {
  try {
    const warden = await Warden.findByIdAndDelete(req.params.id)
    if (!warden) {
      return res.status(404).json({ message: "Warden not found" })
    }
    res.status(200).json({ message: "Warden deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Deactivate User
export const deactivateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.isActive = false;
    await user.save();

    res.status(200).json({ success: true, message: "User deactivated successfully" });
  } catch (error) {
    next(error);
  }
};

// Activate User
export const activateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.isActive = true;
    await user.save();

    res.status(200).json({ success: true, message: "User activated successfully" });
  } catch (error) {
    next(error);
  }
};

// Reset User Password
export const resetUserPassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const newPassword = `temp${Math.floor(1000 + Math.random() * 9000)}`;
    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
      data: { newPassword },
    });
  } catch (error) {
    next(error);
  }
};

// Generate Report
export const generateReport = async (req, res, next) => {
  try {
    const { title, type, period, data, summary, isPublic } = req.body;

    const report = await Report.create({
      title,
      type,
      period,
      data,
      summary,
      isPublic,
      generatedBy: req.user.id,
    });

    res.status(201).json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};

// Get All Reports
export const getAllReports = async (req, res, next) => {
  try {
    const reports = await Report.find()
      .populate("generatedBy", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    next(error);
  }
};

// Get Report By ID
export const getReportById = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id).populate("generatedBy", "name");

    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    res.status(200).json({ success: true, data: report });
  } catch (error) {
    next(error);
  };
};
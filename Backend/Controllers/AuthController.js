import User from "../Models/User.js"
import Student from "../Models/Student.js"
import Warden from "../Models/Warden.js"
import { sendTokenResponse } from "../Config/jwt.js"
import { uploadImage } from "../Config/cloudinary.js"

// Register admin
export const registerAdmin = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, password, adminCode, profilePicture } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      })
    }

    // Validate adminCode
    if (adminCode !== "226028") {
      return res.status(400).json({
        success: false,
        message: "Invalid admin registration code",
      })
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password,
      role: "admin",
      adminCode,
      profilePicture: profilePicture || "",
    })

    // Send token response
    sendTokenResponse(user, 201, res)
  } catch (error) {
    next(error)
  }
}

// Login user (email + password only)
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      })
    }

    const user = await User.findOne({ email }).select("+password")

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    user.lastLogin = Date.now()
    await user.save()

    sendTokenResponse(user, 200, res)
  } catch (error) {
    next(error)
  }
}

// Logout user
export const logout = (req, res) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  })

  res.status(200).json({
    success: true,
    message: "User logged out successfully",
  })
}

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password")

    let profileData = null

    if (user.role === "student") {
      profileData = await Student.findOne({ userId: user._id })
    } else if (user.role === "warden") {
      profileData = await Warden.findOne({ userId: user._id })
    }

    res.status(200).json({
      success: true,
      data: {
        user,
        profileData,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user data",
    })
  }
}

// Update profile
export const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone } = req.body
    const updateData = {}

    if (firstName) updateData.firstName = firstName
    if (lastName) updateData.lastName = lastName

    if (email) {
      const existingEmail = await User.findOne({ email, _id: { $ne: req.user.id } })
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email already in use",
        })
      }
      updateData.email = email
    }

    if (phone) {
      const existingPhone = await User.findOne({ phone, _id: { $ne: req.user.id } })
      if (existingPhone) {
        return res.status(400).json({
          success: false,
          message: "Phone number already in use",
        })
      }
      updateData.phone = phone
    }

    if (req.body.profileImage) {
      const profilePicture = await uploadImage(
        req.body.profileImage,
        `hostel_management/profile/${req.user.role}/${req.user.id}`,
      )
      updateData.profilePicture = profilePicture
    }

    const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true, runValidators: true }).select("-password")

    res.status(200).json({
      success: true,
      data: user,
    })
  } catch (error) {
    next(error)
  }
}

// Change password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide current and new password",
      })
    }

    const user = await User.findById(req.user.id).select("+password")

    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      })
    }

    user.password = newPassword
    await user.save()

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    })
  } catch (error) {
    next(error)
  }
}

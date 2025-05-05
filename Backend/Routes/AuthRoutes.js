import express from "express"
import {
  registerAdmin,
  login,
  logout,
  getCurrentUser,
  updateProfile,
  changePassword,
} from "../Controllers/AuthController.js"
import { protect } from "../Middleware/auth.js"

const router = express.Router()

// Public routes
router.post("/register/admin", registerAdmin)
router.post("/login", login)
router.get("/logout", logout)

// Protected routes
router.get("/me", protect, getCurrentUser)
router.put("/update-profile", protect, updateProfile)
router.put("/change-password", protect, changePassword)

export default router

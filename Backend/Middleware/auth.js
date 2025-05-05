import User from "../Models/User.js"
import { verifyToken } from "../Config/jwt.js"

// Protect routes
export const protect = async (req, res, next) => {
  let token

  // Check for token in headers or cookies
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(" ")[1]
  } else if (req.cookies.token) {
    // Set token from cookie
    token = req.cookies.token
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    })
  }

  try {
    // Verify token
    const decoded = verifyToken(token)

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      })
    }

    // Check if user still exists
    const user = await User.findById(decoded.id)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists",
      })
    }

    // Add user to request
    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    })
  }
}

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      })
    }
    next()
  }
}

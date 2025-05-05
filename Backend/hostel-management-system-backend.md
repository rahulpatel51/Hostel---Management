# Hostel Management System - Backend Documentation

## Table of Contents

1. [Introduction](#introduction)
2. [System Architecture](#system-architecture)
3. [Installation](#installation)
4. [Environment Variables](#environment-variables)
5. [MongoDB Connection](#mongodb-connection)
6. [API Endpoints](#api-endpoints)
7. [Models](#models)
8. [Authentication](#authentication)
9. [File Storage](#file-storage)
10. [Error Handling](#error-handling)
11. [Deployment](#deployment)

## Introduction

This document provides a comprehensive guide to the backend implementation of the Hostel Management System. The system is built using Node.js, Express, and MongoDB, with Cloudinary for file storage.

## System Architecture

The backend follows a modular architecture with the following components:

- **Models**: MongoDB schemas for data storage
- **Controllers**: Business logic for handling requests
- **Routes**: API endpoints for different user roles
- **Middleware**: Authentication and authorization
- **Utils**: Helper functions for common tasks

## Installation

1. Clone the repository
2. Install dependencies:

\`\`\`bash
npm install
\`\`\`

3. Create a `.env` file based on `.env.example`
4. Start the server:

\`\`\`bash
npm start
\`\`\`

For development with auto-restart:

\`\`\`bash
npm run dev
\`\`\`

## Environment Variables

Create a `.env` file in the root directory with the following variables:

\`\`\`
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hostel_management

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
\`\`\`

## MongoDB Connection

The MongoDB connection is established in `server.js`:

\`\`\`javascript
// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });
\`\`\`

### MongoDB Atlas Setup

1. Create a MongoDB Atlas account at [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Set up a database user with read/write permissions
4. Whitelist your IP address or use `0.0.0.0/0` for development
5. Get your connection string and replace `username`, `password`, and `cluster` with your details
6. Add the connection string to your `.env` file as `MONGODB_URI`

## API Endpoints

### Authentication Routes

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | /api/auth/register/admin | Register admin | Public |
| POST | /api/auth/login | Login user | Public |
| GET | /api/auth/logout | Logout user | Public |
| GET | /api/auth/me | Get current user | Private |
| PUT | /api/auth/update-profile | Update user profile | Private |
| PUT | /api/auth/change-password | Change password | Private |

### Admin Routes

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | /api/admin/students | Create student | Admin |
| GET | /api/admin/students | Get all students | Admin |
| GET | /api/admin/students/:id | Get student by ID | Admin |
| PUT | /api/admin/students/:id | Update student | Admin |
| POST | /api/admin/wardens | Create warden | Admin |
| GET | /api/admin/wardens | Get all wardens | Admin |
| GET | /api/admin/wardens/:id | Get warden by ID | Admin |
| PUT | /api/admin/wardens/:id | Update warden | Admin |
| PUT | /api/admin/users/:id/deactivate | Deactivate user | Admin |
| PUT | /api/admin/users/:id/activate | Activate user | Admin |
| PUT | /api/admin/users/:id/reset-password | Reset user password | Admin |
| POST | /api/admin/reports | Generate report | Admin |
| GET | /api/admin/reports | Get all reports | Admin |
| GET | /api/admin/reports/:id | Get report by ID | Admin |

### Student Routes

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/student/profile | Get student profile | Student |
| PUT | /api/student/profile | Update student profile | Student |
| POST | /api/student/complaints | Submit complaint | Student |
| GET | /api/student/complaints | Get all complaints | Student |
| GET | /api/student/complaints/:id | Get complaint by ID | Student |
| POST | /api/student/complaints/:id/comments | Add comment to complaint | Student |
| POST | /api/student/leave | Apply for leave | Student |
| GET | /api/student/leave | Get all leave applications | Student |
| GET | /api/student/leave/:id | Get leave application by ID | Student |
| PUT | /api/student/leave/:id/cancel | Cancel leave application | Student |
| GET | /api/student/fees | Get fee details | Student |
| GET | /api/student/attendance | Get attendance records | Student |

### Warden Routes

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/warden/profile | Get warden profile | Warden |
| PUT | /api/warden/profile | Update warden profile | Warden |
| GET | /api/warden/students | Get students under warden | Warden |
| GET | /api/warden/rooms | Get rooms under warden | Warden |
| GET | /api/warden/complaints | Get complaints | Warden |
| PUT | /api/warden/complaints/:id | Update complaint status | Warden |
| GET | /api/warden/leave | Get leave applications | Warden |
| PUT | /api/warden/leave/:id | Update leave status | Warden |
| POST | /api/warden/attendance | Mark attendance | Warden |
| GET | /api/warden/attendance/:date | Get attendance by date | Warden |
| POST | /api/warden/discipline | Create disciplinary record | Warden |
| GET | /api/warden/discipline | Get disciplinary records | Warden |
| PUT | /api/warden/discipline/:id | Update disciplinary status | Warden |
| POST | /api/warden/notices | Create notice | Warden |
| GET | /api/warden/notices | Get notices | Warden |
| PUT | /api/warden/mess/menu | Update mess menu | Warden |
| GET | /api/warden/mess/:id | Get mess details | Warden |

### Room Routes

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | /api/rooms | Create room | Admin |
| GET | /api/rooms | Get all rooms | Admin, Warden |
| GET | /api/rooms/:id | Get room by ID | Admin, Warden |
| PUT | /api/rooms/:id | Update room | Admin |
| POST | /api/rooms/:id/assign | Assign student to room | Admin, Warden |
| POST | /api/rooms/:id/remove | Remove student from room | Admin, Warden |

## Models

### User Model

\`\`\`javascript
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "student", "warden"],
      required: true,
    },
    profilePicture: {
      type: String,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);
\`\`\`

### Student Model

\`\`\`javascript
const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    rollNumber: {
      type: String,
      required: true,
      unique: true,
    },
    course: {
      type: String,
      required: true,
    },
    batch: {
      type: String,
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    parentContactNumber: {
      type: String,
      required: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: String,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
    },
    academicDetails: {
      currentSemester: Number,
      cgpa: Number,
      attendance: Number,
    },
    feeStatus: {
      type: String,
      enum: ["paid", "pending", "partial"],
      default: "pending",
    },
    disciplinaryRecords: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Discipline",
      },
    ],
  },
  { timestamps: true }
);
\`\`\`

### Warden Model

\`\`\`javascript
const wardenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    employeeId: {
      type: String,
      required: true,
      unique: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    dateOfJoining: {
      type: Date,
      required: true,
    },
    qualification: {
      type: String,
    },
    assignedBlocks: [
      {
        type: String,
      },
    ],
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: String,
    },
  },
  { timestamps: true }
);
\`\`\`

## Authentication

The system uses JWT (JSON Web Tokens) for authentication. The token is stored in an HTTP-only cookie for security.

### JWT Utilities

\`\`\`javascript
// Generate JWT token
export const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
  });
};

// Verify JWT token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Set token in cookie
export const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = generateToken(user._id, user.role);

  const options = {
    expires: new Date(Date.now() + JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
      },
    });
};
\`\`\`

### Authentication Middleware

\`\`\`javascript
// Protect routes
export const protect = async (req, res, next) => {
  let token;

  // Check for token in headers or cookies
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.token) {
    // Set token from cookie
    token = req.cookies.token;
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }

  try {
    // Verify token
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists",
      });
    }

    // Add user to request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }
};

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};
\`\`\`

## File Storage

The system uses Cloudinary for storing images and documents. The Cloudinary configuration is set up in `utils/cloudinary.js`.

\`\`\`javascript
// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload image to Cloudinary
export const uploadImage = async (file, folder = "hostel_management") => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder,
      resource_type: "auto",
    });
    return result.secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw new Error("Image upload failed");
  }
};

// Upload multiple images to Cloudinary
export const uploadMultipleImages = async (files, folder = "hostel_management") => {
  try {
    const uploadPromises = files.map((file) => uploadImage(file, folder));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error("Error uploading multiple images to Cloudinary:", error);
    throw new Error("Multiple image upload failed");
  }
};

// Delete image from Cloudinary
export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw new Error("Image deletion failed");
  }
};
\`\`\`

## Error Handling

The system includes a global error handling middleware in `server.js`:

\`\`\`javascript
// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
\`\`\`

## Deployment

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- Cloudinary account

### Deployment Steps

1. Set up a MongoDB Atlas cluster
2. Create a Cloudinary account
3. Set up environment variables on your hosting platform
4. Build and deploy the application

### Hosting Options

- **Heroku**: Easy deployment with Git integration
- **Vercel**: Good for serverless Node.js applications
- **DigitalOcean**: More control with virtual private servers
- **AWS**: Scalable with various hosting options

## Package.json

\`\`\`json
{
  "name": "hostel-management-backend",
  "version": "1.0.0",
  "description": "Backend for Hostel Management System",
  "main": "server.js",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "bcrypt": "^5.1.0",
    "cloudinary": "^1.37.0",
    "cookie-parser": "^1.4.6",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.0",
    "mongoose": "^7.2.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.22"
  }
}
\`\`\`

## Additional Configuration

### CORS Configuration

\`\`\`javascript
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
\`\`\`

### Security Best Practices

1. **Use HTTPS**: Always use HTTPS in production
2. **Rate Limiting**: Implement rate limiting to prevent abuse
3. **Input Validation**: Validate all user inputs
4. **Secure Headers**: Use security headers like Helmet
5. **Environment Variables**: Never hardcode sensitive information

## API Testing

You can test the API using tools like Postman or Insomnia. Here's a sample request for login:

\`\`\`
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}
\`\`\`

## Connecting to Frontend

To connect the backend to your React frontend, create API service files that handle the HTTP requests. Here's an example:

\`\`\`javascript
// api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Auth services
export const login = (username, password) => {
  return api.post('/auth/login', { username, password });
};

export const logout = () => {
  return api.get('/auth/logout');
};

export const getCurrentUser = () => {
  return api.get('/auth/me');
};

// Student services
export const getStudentProfile = () => {
  return api.get('/student/profile');
};

export const submitComplaint = (complaintData) => {
  return api.post('/student/complaints', complaintData);
};

// Warden services
export const getWardenProfile = () => {
  return api.get('/warden/profile');
};

export const getStudentsUnderWarden = () => {
  return api.get('/warden/students');
};

// Admin services
export const createStudent = (studentData) => {
  return api.post('/admin/students', studentData);
};

export const getAllStudents = () => {
  return api.get('/admin/students');
};

// Add more API services as needed
\`\`\`


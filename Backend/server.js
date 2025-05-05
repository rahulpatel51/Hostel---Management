import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Routes
import authRoutes from "./Routes/AuthRoutes.js";
import adminRoutes from "./Routes/AdminRoutes.js";
import studentRoutes from "./Routes/StudentRoutes.js";
import wardenRoutes from "./Routes/WardenRoutes.js";
import roomRoutes from "./Routes/RoomRoutes.js";
import noticeRoutes from "./Routes/NoticeRoutes.js";
import messRoutes from "./Routes/MessRoutes.js";

dotenv.config();

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(cookieParser());

// Serve static files (e.g., uploaded images)
app.use("/uploads", express.static(join(__dirname, "uploads")));

// API Routes
app.use("/api/auth", authRoutes); 
app.use("/api/admin", adminRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/warden", wardenRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/mess", messRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("🏨 Hostel Management System API is running...");
});

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong!";
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

// Database Connection & Server Start
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () =>
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
  });

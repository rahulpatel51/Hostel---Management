import mongoose from "mongoose"

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    morningStatus: {
      type: String,
      enum: ["present", "absent", "leave", "late"],
      required: true,
    },
    eveningStatus: {
      type: String,
      enum: ["present", "absent", "leave", "late"],
      required: true,
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    remarks: {
      type: String,
    },
  },
  { timestamps: true },
)

// Compound index to ensure unique attendance records per student per day
attendanceSchema.index({ student: 1, date: 1 }, { unique: true })

const Attendance = mongoose.model("Attendance", attendanceSchema)

export default Attendance

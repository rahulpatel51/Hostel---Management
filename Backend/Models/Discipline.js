import mongoose from "mongoose"

const disciplineSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    issueDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    issueType: {
      type: String,
      enum: ["warning", "minor_violation", "major_violation", "critical_violation"],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    witnesses: [
      {
        type: String,
      },
    ],
    evidence: [
      {
        type: String, // URLs to evidence files
      },
    ],
    action: {
      type: String,
      enum: ["warning", "fine", "community_service", "suspension", "expulsion", "other"],
      required: true,
    },
    actionDetails: {
      type: String,
    },
    fineAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "resolved", "appealed", "dismissed"],
      default: "pending",
    },
    comments: [
      {
        text: String,
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true },
)

const Discipline = mongoose.model("Discipline", disciplineSchema)

export default Discipline

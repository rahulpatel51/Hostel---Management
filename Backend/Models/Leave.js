import mongoose from "mongoose"

const leaveSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    leaveType: {
      type: String,
      enum: ["home", "medical", "academic", "emergency", "other"],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    contactDuringLeave: {
      type: String,
      required: true,
    },
    parentApproval: {
      type: Boolean,
      default: false,
    },
    documents: [
      {
        type: String, // URLs to supporting documents
      },
    ],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvalDate: {
      type: Date,
    },
    remarks: {
      type: String,
    },
    actualReturnDate: {
      type: Date,
    },
  },
  { timestamps: true },
)

const Leave = mongoose.model("Leave", leaveSchema)

export default Leave

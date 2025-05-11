import mongoose from "mongoose"

const complaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      
    },
    description: {
      type: String,
      
    },
    category: {
      type: String,
      enum: ["Maintenance", "Cleanliness", "Food", "Security", "Other"],
      
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "resolved", "rejected"],
      default: "pending",
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    roomNumber: {
      type: String,
    },
    images: [
      {
        type: String,
      },
    ],
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
    resolvedAt: {
      type: Date,
    },
  },
  { timestamps: true },
)

const Complaint = mongoose.model("Complaint", complaintSchema)

export default Complaint

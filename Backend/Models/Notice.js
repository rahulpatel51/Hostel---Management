import mongoose from "mongoose"

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["general", "academic", "hostel", "event", "emergency", "other"],
      default: "general",
    },
    importance: {
      type: String,
      enum: ["normal", "important", "urgent"],
      default: "normal",
    },
    publishedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetAudience: {
      type: [String],
      enum: ["all", "students", "wardens", "admin"],
      default: ["all"],
    },
    attachments: [
      {
        type: String,
      },
    ],
    expiryDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
)

const Notice = mongoose.model("Notice", noticeSchema)

export default Notice

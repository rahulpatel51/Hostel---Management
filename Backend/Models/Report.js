import mongoose from "mongoose"

const reportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["occupancy", "fee_collection", "attendance", "complaint", "discipline", "general"],
      required: true,
    },
    period: {
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        required: true,
      },
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    summary: {
      type: String,
    },
    charts: [
      {
        type: String, // URLs to chart images
      },
    ],
    downloadUrl: {
      type: String,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

const Report = mongoose.model("Report", reportSchema)

export default Report

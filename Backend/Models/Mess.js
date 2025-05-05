import mongoose from "mongoose"

const messMenuSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    required: true,
  },
  breakfast: {
    items: [String],
    time: String,
  },
  lunch: {
    items: [String],
    time: String,
  },
  snacks: {
    items: [String],
    time: String,
  },
  dinner: {
    items: [String],
    time: String,
  },
  specialMenu: {
    type: Boolean,
    default: false,
  },
})

const messSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    weeklyMenu: [messMenuSchema],
    currentMenu: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MessMenu",
    },
    messManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    contactNumber: {
      type: String,
    },
    capacity: {
      type: Number,
    },
    timings: {
      breakfast: String,
      lunch: String,
      snacks: String,
      dinner: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
)

const Mess = mongoose.model("Mess", messSchema)

export default Mess

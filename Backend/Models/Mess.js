import mongoose from "mongoose"

const feedbackSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 5,
  },
  comment: {
    type: String,
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
})

const messMenuSchema = new mongoose.Schema({
  day: {
    type: String,
    
    enum: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  },
  date: {
    type: Date,
  },
  meals: {
    breakfast: { type: String },
    lunch: { type: String },
    snacks: { type: String },
    dinner: { type: String },
  },
  feedbacks: [feedbackSchema],
})

export default mongoose.model("MessMenu", messMenuSchema)

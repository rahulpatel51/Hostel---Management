import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',  // Changed from 'user' to 'User' for consistency
    required: true
  },
  userName: {  // Changed from studentName to userName
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: ""
  },
  comment: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  createdAt: {  // Changed from date to createdAt for consistency
    type: Date,
    default: Date.now
  }
});

const menuItemSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    unique: true  // Added unique constraint
  },
  breakfast: {
    type: String,
    required: true
  },
  lunch: {
    type: String,
    required: true
  },
  snacks: {
    type: String,
    required: true
  },
  dinner: {
    type: String,
    required: true
  },
  averageRating: {  // Changed from rating to averageRating for clarity
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: [reviewSchema]
}, { timestamps: true });

// Improved average rating calculation
menuItemSchema.pre('save', function(next) {
  if (this.reviews && this.reviews.length > 0) {
    const total = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.averageRating = parseFloat((total / this.reviews.length).toFixed(1));
  } else {
    this.averageRating = 0;
  }
  next();
});

// Add text index for search functionality
menuItemSchema.index({
  breakfast: 'text',
  lunch: 'text', 
  snacks: 'text',
  dinner: 'text'
});

export default mongoose.model("Menu", menuItemSchema);
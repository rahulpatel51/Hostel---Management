import mongoose from "mongoose";
import bcrypt from "bcrypt";

// Helper function to generate a random 4-digit number
const generateRandomId = () => {
  return Math.floor(1000 + Math.random() * 9000); // Random 4-digit number
};

const staffSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"]
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"]
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/.+\@.+\..+/, "Please enter a valid email"]
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[0-9]{10,15}$/, "Please enter a valid phone number"]
    },
    password: {
      type: String,
      minlength: [8, "Password must be at least 8 characters"],
      select: false
    },
    role: {
      type: String,
      enum: ["superadmin", "admin", "warden", "student"],
      default: "admin",
      required: true
    },
    department: {
      type: String,
      enum: ["Warden", "Mess"],
    },
    staffId: {
      type: String,
      unique: true
    },
    profilePicture: {
      type: String,
      default: ""
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Auto-generate staffId like WARDXXXX or MESSXXXX
staffSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(12);
    this.password = bcrypt.hash(this.password, salt);
  }

  // Generate a staffId only if it's not already set
  if (!this.staffId) {
    const prefix = this.department === "Warden" ? "WARD" : "MESS";
    const randomId = generateRandomId(); // Generate a random 4-digit number
    this.staffId = `${prefix}${randomId}`;
  }

  next();
});

// 🔑 Compare password method
staffSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const Staff = mongoose.model("Staff", staffSchema);

export default Staff;

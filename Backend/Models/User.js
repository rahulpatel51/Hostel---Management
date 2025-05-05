import mongoose from "mongoose";
import bcrypt from "bcrypt";

// Helper function to generate a random 4-digit number
const generateRandomId = () => {
  return Math.floor(1000 + Math.random() * 9000); // Random 4-digit number
};

// Helper function to generate a random 4-digit studentId
const generateRandomStudentId = () => {
  const randomDigits = Math.floor(1000 + Math.random() * 9000); // Random 4-digit number
  return `STD${randomDigits}`;
};

const userSchema = new mongoose.Schema(
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
    adminCode: {
      type: String,
      required: [true, "Admin registration code is required"],
      default: "226028",
      validate: {
        validator: function (val) {
          if (this.role === "admin" || this.role === "superadmin") {
            return val === "226028";
          }
          return true;
        },
        message: "Invalid admin registration code"
      }
    },
    studentId: {
      type: String,
      unique: true,
      sparse: true // ensures uniqueness only when studentId exists
    },
    staffId: {
      type: String,
      unique: true,
      sparse: true // ensures uniqueness only when staffId exists
    },
    profilePicture: {
      type: String,
      default: ""
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastLogin: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
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
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpires;
        return ret;
      }
    }
  }
);

// 🔐 Hash password
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  }

  // 📌 Auto-generate studentId if role is 'student' and studentId is not set
  if (this.role === "student" && !this.studentId) {
    let studentId = generateRandomStudentId();

    // Ensure the studentId is unique by checking if it already exists in the database
    while (await mongoose.model("User").findOne({ studentId })) {
      studentId = generateRandomStudentId(); // Regenerate if ID already exists
    }

    this.studentId = studentId;
  }

  // 📌 Auto-generate staffId if role is 'warden' or 'mess' and staffId is not set
  if ((this.role === "warden" || this.role === "admin") && !this.staffId) {
    const prefix = this.role === "warden" ? "WARD" : "MESS"; // Determine prefix based on role
    let staffId = `${prefix}${generateRandomId()}`;

    // Ensure the staffId is unique by checking if it already exists in the database
    while (await mongoose.model("User").findOne({ staffId })) {
      staffId = `${prefix}${generateRandomId()}`; // Regenerate if ID already exists
    }

    this.staffId = staffId;
  }

  next();
});

// 🔑 Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// 📌 Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: 1 });

// 🎯 Virtual: full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

const User = mongoose.model("User", userSchema);

export default User;

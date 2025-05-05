import mongoose from "mongoose"

const feeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
    },
    semester: {
      type: Number,
      required: true,
    },
    feeType: {
      type: String,
      enum: ["hostel", "mess", "security", "maintenance", "other"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "partial", "paid", "overdue", "waived"],
      default: "pending",
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    paymentDate: {
      type: Date,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "online_transfer", "cheque", "card", "other"],
    },
    transactionId: {
      type: String,
    },
    receiptUrl: {
      type: String,
    },
    remarks: {
      type: String,
    },
  },
  { timestamps: true },
)

const Fee = mongoose.model("Fee", feeSchema)

export default Fee

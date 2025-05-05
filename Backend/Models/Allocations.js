import mongoose from "mongoose";

const allocationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      validate: {
        validator: async function(studentId) {
          const student = await mongoose.model("Student").findById(studentId);
          return !!student;
        },
        message: "Student does not exist"
      }
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
      validate: {
        validator: async function(roomId) {
          const room = await mongoose.model("Room").findById(roomId);
          return !!room;
        },
        message: "Room does not exist"
      }
    },
    bedNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 4,
      validate: {
        validator: async function(bedNumber) {
          const room = await mongoose.model("Room").findById(this.room);
          return room ? bedNumber <= room.capacity : false;
        },
        message: "Bed number exceeds room capacity"
      }
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
      validate: {
        validator: function(date) {
          return date <= new Date();
        },
        message: "Start date cannot be in the future"
      }
    },
    endDate: {
      type: Date,
      validate: {
        validator: function(date) {
          return !date || date >= this.startDate;
        },
        message: "End date must be after start date"
      }
    },
    status: {
      type: String,
      required: true,
      enum: ["Active", "Completed", "Cancelled"],
      default: "Active"
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ["Paid", "Partial", "Pending"],
      default: "Pending"
    },
    allocatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

// Update room occupancy when allocation is created
allocationSchema.post("save", async function (doc) {
  if (doc.status === "Active") {
    try {
      const Room = mongoose.model("Room");
      const room = await Room.findById(doc.room);

      if (room && room.occupiedCount < room.capacity) {
        room.occupiedCount += 1;
        await room.save();
      }

      // Update student's room reference
      await mongoose.model("Student").findByIdAndUpdate(doc.student, { 
        room: doc.room,
        $push: { allocationHistory: doc._id }
      });
    } catch (err) {
      console.error("Error updating room occupancy:", err);
    }
  }
});

// Update room occupancy when allocation status changes
allocationSchema.post("findOneAndUpdate", async function (doc) {
  if (!doc) return;

  const updatedStatus = this.getUpdate().status;
  if (updatedStatus === "Completed" || updatedStatus === "Cancelled") {
    try {
      const Room = mongoose.model("Room");
      const room = await Room.findById(doc.room);

      if (room && room.occupiedCount > 0) {
        room.occupiedCount -= 1;
        await room.save();
      }

      // Remove student's room reference
      await mongoose.model("Student").findByIdAndUpdate(doc.student, { 
        $unset: { room: "" },
        $push: { allocationHistory: doc._id }
      });
    } catch (err) {
      console.error("Error updating room occupancy:", err);
    }
  }
});

// Validate bed availability before saving
allocationSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("bedNumber") || this.isModified("room")) {
    const existingAllocation = await mongoose.model("Allocation").findOne({
      room: this.room,
      bedNumber: this.bedNumber,
      status: "Active",
      _id: { $ne: this._id }
    });

    if (existingAllocation) {
      throw new Error(`Bed ${this.bedNumber} is already occupied in this room`);
    }
  }
  next();
});

const Allocation = mongoose.model("Allocation", allocationSchema);

export default Allocation;
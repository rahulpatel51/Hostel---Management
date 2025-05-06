import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    block: {
      type: String,
      required: true,
      enum: ["A", "B", "C", "D"], 
    },
    roomNumber: {
      type: String,
      match: /^[A-D]-\d{3}$/, // Matches room numbers like A-101, B-102, etc.
    },
    roomId: {
      type: String,
      unique: true,
    },
    floor: {
      type: String,
      enum: ["1st Floor", "2nd Floor", "3rd Floor", "4th Floor"],
    },
    capacity: {
      type: Number,
      min: 1,
      max: 4,
      default: 2,
    },
    occupiedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    roomType: {
      type: String,
      required: true,
      enum: [
        "AC Room - Boys",
        "AC Room - Girls",
        "Non-AC Room - Boys",
        "Non-AC Room - Girls",
        "Deluxe Room - Boys",
        "Deluxe Room - Girls",
      ],
    },
    facilities: {
      type: [String],
      enum: [
        "Air Conditioning",
        "Study Table",
        "Premium Furniture",
        "High-Speed WiFi",
        "Attached Bathroom",
        "Fan",
        "Geyser",
        "Laundry Service",
      ],
    },
    occupants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    status: {
      type: String,
      enum: ["Available", "Full", "Maintenance"],
      default: "Available",
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      min: 0,
    },
    pricePeriod: {
      type: String,
      enum: ["month", "semester", "year"],
      default: "month",
    },
    imageUrl: {
      type: String,
      match: /^https?:\/\/.+/,
    },
    lastMaintenance: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Auto-generate roomId before saving
roomSchema.pre("validate", async function (next) {
  if (!this.roomId && this.block && this.roomNumber) {
    const existingRoom = await Room.findOne({
      block: this.block,
      roomNumber: this.roomNumber,
    });

    if (existingRoom) {
      return next(new Error("Room number already exists in this block."));
    }

    this.roomId = `RM-${this.roomNumber}`; // Format like A-101, B-102, etc.
  }
  next();
});

// Automatically update room status
roomSchema.pre("save", function (next) {
  if (this.status === "Maintenance") {
    this.occupiedCount = 0;
  } else if (this.occupiedCount === 0) {
    this.status = "Available";
  } else if (this.occupiedCount >= this.capacity) {
    this.status = "Full";
  } else {
    this.status = "Available";
  }
  next();
});

const Room = mongoose.model("Room", roomSchema);

export default Room;

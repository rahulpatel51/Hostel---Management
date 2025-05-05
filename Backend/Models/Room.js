import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
      match: /^[A-D]-\d{3}$/, // Pattern like A-101, B-205 etc.
    },
    block: {
      type: String,
      required: true,
      enum: ["A", "B", "C", "D"], // Changed to single letter to match your UI
    },
    floor: {
      type: String,
      required: true,
      enum: ["1st", "2nd", "3rd", "4th"], // Changed to match your UI format
    },
    capacity: {
      type: Number,
      required: true,
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
        "Deluxe Room - Girls"
      ], // Updated to match your UI
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
        "Laundry Service"
      ], // Added enum for validation
    },
    occupants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    status: {
      type: String,
      enum: ["Available", "Full", "Maintenance"], // Changed to match your UI
      default: "Available",
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    pricePeriod: {
      type: String,
      enum: ["month", "semester", "year"],
      default: "month",
    },
    imageUrl: {
      type: String,
      required: true,
      match: /^https?:\/\/.+/, // Simple URL validation
    },
    lastMaintenance: {
      type: Date,
    },
  },
  { timestamps: true },
);

// Update room status based on occupancy
roomSchema.pre("save", function (next) {
  if (this.status === "Maintenance") {
    this.occupiedCount = 0;
  } else if (this.occupiedCount === 0) {
    this.status = "Available";
  } else if (this.occupiedCount >= this.capacity) {
    this.status = "Full";
  } else {
    this.status = "Available"; // Changed to match your UI which only has Available/Full/Maintenance
  }
  next();
});

// Update block statistics when room changes
roomSchema.post("save", async function (doc) {
  const Block = mongoose.model("Block");
  try {
    const block = await Block.findOne({ name: `Block ${doc.block}` });
    if (block) {
      const rooms = await mongoose.model("Room").find({ block: doc.block });
      
      block.occupiedRooms = rooms.filter(r => r.status === "Full").length;
      block.maintenanceRooms = rooms.filter(r => r.status === "Maintenance").length;
      block.vacantRooms = block.totalRooms - block.occupiedRooms - block.maintenanceRooms;
      
      await block.save();
    }
  } catch (err) {
    console.error("Error updating block statistics:", err);
  }
});

const Room = mongoose.model("Room", roomSchema);

export default Room;
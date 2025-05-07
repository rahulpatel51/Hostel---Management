import Room from "../Models/Room.js";
import Student from "../Models/Student.js";


// Create Room
export const createRoom = async (req, res, next) => {
  try {
    const {
      block,
      floor,
      capacity,
      roomType,
      facilities,
      description,
      price,
      pricePeriod,
      roomNumber,
      imageUrl, // Now coming from Cloudinary upload
    } = req.body;

    // Check if room already exists
    const existingRoom = await Room.findOne({ block, roomNumber });
    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: `Room ${roomNumber} already exists in Block ${block}.`,
      });
    }

    const newRoom = new Room({
      block,
      floor,
      capacity,
      roomType,
      facilities,
      description,
      price,
      pricePeriod,
      imageUrl,
      roomNumber,
      occupiedCount: 0,
    });

    const savedRoom = await newRoom.save();
    res.status(201).json({ success: true, data: savedRoom });
  } catch (error) {
    next(error);
  }
};

// Get All Rooms
export const getAllRooms = async (req, res, next) => {
  try {
    const { block, floor, status, roomType } = req.query;
    const query = {};

    if (block) query.block = block;
    if (floor) query.floor = floor;
    if (status) query.status = status;
    if (roomType) query.roomType = roomType;

    const rooms = await Room.find(query).populate({
      path: "occupants",
      select: "name rollNumber",
      populate: {
        path: "userId",
        select: "username profilePicture",
      },
    });

    res.status(200).json({ success: true, count: rooms.length, data: rooms });
  } catch (error) {
    next(error);
  }
};

// Get Room by ID
export const getRoomById = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id).populate({
      path: "occupants",
      select: "name rollNumber",
      populate: {
        path: "userId",
        select: "username profilePicture",
      },
    });

    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found." });
    }

    res.status(200).json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
};

// Update Room
export const updateRoom = async (req, res, next) => {
  try {
    const updateFields = { ...req.body };

    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found." });
    }

    if (
      updateFields.capacity &&
      Number(updateFields.capacity) < room.occupiedCount
    ) {
      return res.status(400).json({
        success: false,
        message: `New capacity (${updateFields.capacity}) cannot be less than current occupancy (${room.occupiedCount}).`,
      });
    }

    const updatedRoom = await Room.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: updatedRoom });
  } catch (error) {
    next(error);
  }
};

// Delete Room
export const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found." });
    }

    // Remove room assignment from students
    await Student.updateMany(
      { roomId: room._id },
      { $unset: { roomId: "" } }
    );

    // Optionally: handle Cloudinary image deletion here if desired (not implemented)
    // You would need the `public_id` stored in DB for this.

    await room.deleteOne();

    res.status(200).json({ success: true, message: "Room deleted successfully." });
  } catch (error) {
    next(error);
  }
};

// Assign Student to Room
export const assignStudentToRoom = async (req, res, next) => {
  try {
    const { studentId } = req.body;

    const [room, student] = await Promise.all([
      Room.findById(req.params.id),
      Student.findById(studentId),
    ]);

    if (!room) return res.status(404).json({ success: false, message: "Room not found." });
    if (!student) return res.status(404).json({ success: false, message: "Student not found." });

    if (room.occupiedCount >= room.capacity) {
      return res.status(400).json({ success: false, message: "Room is full." });
    }

    // Remove student from previous room if needed
    if (student.roomId && student.roomId.toString() !== room._id.toString()) {
      await Room.findByIdAndUpdate(student.roomId, {
        $inc: { occupiedCount: -1 },
        $pull: { occupants: student._id },
      });
    }

    // Assign to new room
    room.occupants.push(student._id);
    room.occupiedCount += 1;
    await room.save();

    student.roomId = room._id;
    await student.save();

    res.status(200).json({ success: true, message: "Student assigned successfully.", data: room });
  } catch (error) {
    next(error);
  }
};

// Remove Student from Room
export const removeStudentFromRoom = async (req, res, next) => {
  try {
    const { studentId } = req.body;

    const [room, student] = await Promise.all([
      Room.findById(req.params.id),
      Student.findById(studentId),
    ]);

    if (!room || !student) {
      return res.status(404).json({ success: false, message: "Room or Student not found." });
    }

    if (!student.roomId || student.roomId.toString() !== room._id.toString()) {
      return res.status(400).json({ success: false, message: "Student is not assigned to this room." });
    }

    room.occupants = room.occupants.filter(id => id.toString() !== studentId);
    room.occupiedCount = Math.max(0, room.occupiedCount - 1);
    await room.save();

    student.roomId = null;
    await student.save();

    res.status(200).json({ success: true, message: "Student removed from room.", data: room });
  } catch (error) {
    next(error);
  }
};

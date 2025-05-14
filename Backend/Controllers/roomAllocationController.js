import Room from "../Models/Room.js";
import Student from "../Models/Student.js";

export const allocateRoom = async (req, res) => {
  try {
    const { studentId, roomId } = req.body;

    const student = await Student.findById(studentId);
    const room = await Room.findById(roomId);

    if (!student) return res.status(404).json({ message: "Student not found" });
    if (!room) return res.status(404).json({ message: "Room not found" });

    if (student.roomId)
      return res.status(400).json({ message: "Student already has a room allocated" });

    if (room.status !== "Available")
      return res.status(400).json({ message: `Room is not available: Status - ${room.status}` });

    if (room.occupiedCount >= room.capacity)
      return res.status(400).json({ message: "Room is full" });

    // ✅ Allocate Room
    room.occupants.push(student._id);
    room.occupiedCount += 1;

    if (room.occupiedCount >= room.capacity) {
      room.status = "Full";
    }

    student.roomId = room._id;

    await room.save();
    await student.save();

    res.status(200).json({ message: "Room allocated successfully", student, room });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deallocateRoom = async (req, res) => {
  try {
    const { studentId } = req.body;

    const student = await Student.findById(studentId);
    if (!student || !student.roomId) {
      return res.status(404).json({ message: "Student not found or not allocated to any room" });
    }

    const room = await Room.findById(student.roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // ✅ Deallocate
    room.occupants = room.occupants.filter(id => id.toString() !== student._id.toString());
    room.occupiedCount -= 1;

    if (room.status !== "Maintenance") {
      room.status = room.occupiedCount === 0 ? "Available" : "Available"; // Maintain logic
    }

    student.roomId = null;

    await room.save();
    await student.save();

    res.status(200).json({ message: "Room deallocated successfully", student, room });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllAllocatedRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate("occupants", "name email course");
    res.status(200).json(rooms);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch rooms" });
  }
};

export const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().populate("roomId");
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch students" });
  }
};


export const getStudentWithRoomDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id).populate({
      path: "roomId",
      populate: {
        path: "occupants", // if you want to see who else is in the same room
        select: "name email"
      }
    });

    if (!student) return res.status(404).json({ message: "Student not found" });

    res.status(200).json({ student });
  } catch (err) {
    console.error("Error fetching student with room:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
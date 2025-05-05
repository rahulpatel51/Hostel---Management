import Room from "../Models/Room.js"
import Student from "../Models/Student.js"

// Create room
export const createRoom = async (req, res, next) => {
  try {
    const { roomNumber, block, floor, capacity, roomType, facilities } = req.body

    // Check if room already exists
    const existingRoom = await Room.findOne({ roomNumber })
    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: "Room with this number already exists",
      })
    }

    // Create room
    const room = await Room.create({
      roomNumber,
      block,
      floor,
      capacity,
      roomType,
      facilities,
      status: "available",
    })

    res.status(201).json({
      success: true,
      data: room,
    })
  } catch (error) {
    next(error)
  }
}

// Get all rooms
export const getAllRooms = async (req, res, next) => {
  try {
    // Filter by query params
    const { block, floor, status, roomType } = req.query
    const query = {}

    if (block) query.block = block
    if (floor) query.floor = Number.parseInt(floor)
    if (status) query.status = status
    if (roomType) query.roomType = roomType

    const rooms = await Room.find(query).populate({
      path: "occupants",
      select: "name rollNumber",
      populate: {
        path: "userId",
        select: "username profilePicture",
      },
    })

    res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms,
    })
  } catch (error) {
    next(error)
  }
}

// Get room by ID
export const getRoomById = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id).populate({
      path: "occupants",
      select: "name rollNumber",
      populate: {
        path: "userId",
        select: "username profilePicture",
      },
    })

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      })
    }

    res.status(200).json({
      success: true,
      data: room,
    })
  } catch (error) {
    next(error)
  }
}

// Update room
export const updateRoom = async (req, res, next) => {
  try {
    const { roomNumber, block, floor, capacity, roomType, facilities, status } = req.body

    // Find room
    const room = await Room.findById(req.params.id)

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      })
    }

    // Check if new capacity is less than current occupants
    if (capacity && capacity < room.occupiedCount) {
      return res.status(400).json({
        success: false,
        message: "New capacity cannot be less than current occupants count",
      })
    }

    // Update room
    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      {
        roomNumber,
        block,
        floor,
        capacity,
        roomType,
        facilities,
        status,
      },
      { new: true, runValidators: true },
    )

    res.status(200).json({
      success: true,
      data: updatedRoom,
    })
  } catch (error) {
    next(error)
  }
}

// Assign student to room
export const assignStudentToRoom = async (req, res, next) => {
  try {
    const { studentId } = req.body

    // Find room
    const room = await Room.findById(req.params.id)

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      })
    }

    // Check if room is full
    if (room.occupiedCount >= room.capacity) {
      return res.status(400).json({
        success: false,
        message: "Room is already at full capacity",
      })
    }

    // Find student
    const student = await Student.findById(studentId)

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      })
    }

    // Check if student is already assigned to a room
    if (student.roomId) {
      // Remove student from previous room
      await Room.findByIdAndUpdate(student.roomId, {
        $inc: { occupiedCount: -1 },
        $pull: { occupants: student._id },
      })
    }

    // Assign student to room
    room.occupants.push(student._id)
    room.occupiedCount += 1
    await room.save()

    // Update student's room
    student.roomId = room._id
    await student.save()

    res.status(200).json({
      success: true,
      data: room,
    })
  } catch (error) {
    next(error)
  }
}

// Remove student from room
export const removeStudentFromRoom = async (req, res, next) => {
  try {
    const { studentId } = req.body

    // Find room
    const room = await Room.findById(req.params.id)

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      })
    }

    // Find student
    const student = await Student.findById(studentId)

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      })
    }

    // Check if student is assigned to this room
    if (!student.roomId || student.roomId.toString() !== req.params.id) {
      return res.status(400).json({
        success: false,
        message: "Student is not assigned to this room",
      })
    }

    // Remove student from room
    room.occupants = room.occupants.filter((occupant) => occupant.toString() !== studentId)
    room.occupiedCount -= 1
    await room.save()

    // Update student's room
    student.roomId = null
    await student.save()

    res.status(200).json({
      success: true,
      data: room,
    })
  } catch (error) {
    next(error)
  }
}

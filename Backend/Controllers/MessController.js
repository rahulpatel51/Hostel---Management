import Mess from "../Models/Mess.js"

// Create mess
export const createMess = async (req, res, next) => {
  try {
    const { name, weeklyMenu, messManager, contactNumber, capacity, timings } = req.body

    // Create mess
    const mess = await Mess.create({
      name,
      weeklyMenu,
      messManager,
      contactNumber,
      capacity,
      timings,
    })

    res.status(201).json({
      success: true,
      data: mess,
    })
  } catch (error) {
    next(error)
  }
}

// Get all messes
export const getAllMesses = async (req, res, next) => {
  try {
    const messes = await Mess.find().populate({
      path: "messManager",
      select: "username",
    })

    res.status(200).json({
      success: true,
      count: messes.length,
      data: messes,
    })
  } catch (error) {
    next(error)
  }
}

// Get mess by ID
export const getMessById = async (req, res, next) => {
  try {
    const mess = await Mess.findById(req.params.id).populate({
      path: "messManager",
      select: "username",
    })

    if (!mess) {
      return res.status(404).json({
        success: false,
        message: "Mess not found",
      })
    }

    res.status(200).json({
      success: true,
      data: mess,
    })
  } catch (error) {
    next(error)
  }
}

// Update mess
export const updateMess = async (req, res, next) => {
  try {
    const { name, weeklyMenu, messManager, contactNumber, capacity, timings, isActive } = req.body

    // Find mess
    const mess = await Mess.findById(req.params.id)

    if (!mess) {
      return res.status(404).json({
        success: false,
        message: "Mess not found",
      })
    }

    // Update mess
    const updatedMess = await Mess.findByIdAndUpdate(
      req.params.id,
      {
        name,
        weeklyMenu,
        messManager,
        contactNumber,
        capacity,
        timings,
        isActive,
      },
      { new: true, runValidators: true },
    )

    res.status(200).json({
      success: true,
      data: updatedMess,
    })
  } catch (error) {
    next(error)
  }
}

// Update mess menu
export const updateMessMenu = async (req, res, next) => {
  try {
    const { weeklyMenu } = req.body

    // Find mess
    const mess = await Mess.findById(req.params.id)

    if (!mess) {
      return res.status(404).json({
        success: false,
        message: "Mess not found",
      })
    }

    // Update mess menu
    mess.weeklyMenu = weeklyMenu
    await mess.save()

    res.status(200).json({
      success: true,
      data: mess,
    })
  } catch (error) {
    next(error)
  }
}

// Delete mess
export const deleteMess = async (req, res, next) => {
  try {
    const mess = await Mess.findById(req.params.id)

    if (!mess) {
      return res.status(404).json({
        success: false,
        message: "Mess not found",
      })
    }

    await mess.deleteOne()

    res.status(200).json({
      success: true,
      message: "Mess deleted successfully",
    })
  } catch (error) {
    next(error)
  }
}

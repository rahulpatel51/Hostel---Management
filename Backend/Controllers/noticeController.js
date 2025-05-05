import Notice from "../Models/Notice.js"
import { uploadMultipleImages } from "../Config/cloudinary.js"

// Create notice
export const createNotice = async (req, res, next) => {
  try {
    const { title, content, category, importance, targetAudience, expiryDate } = req.body

    // Upload attachments if provided
    let attachments = []
    if (req.body.attachments && req.body.attachments.length > 0) {
      attachments = await uploadMultipleImages(req.body.attachments, `hostel_management/notices`)
    }

    // Create notice
    const notice = await Notice.create({
      title,
      content,
      category,
      importance,
      publishedBy: req.user.id,
      targetAudience,
      attachments,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
    })

    res.status(201).json({
      success: true,
      data: notice,
    })
  } catch (error) {
    next(error)
  }
}

// Get all notices
export const getAllNotices = async (req, res, next) => {
  try {
    // Filter notices based on user role
    const query = { isActive: true }

    if (req.user.role === "student") {
      query.$or = [{ targetAudience: "all" }, { targetAudience: "students" }]
    } else if (req.user.role === "warden") {
      query.$or = [{ targetAudience: "all" }, { targetAudience: "wardens" }]
    }

    const notices = await Notice.find(query)
      .populate({
        path: "publishedBy",
        select: "username",
      })
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: notices.length,
      data: notices,
    })
  } catch (error) {
    next(error)
  }
}

// Get notice by ID
export const getNoticeById = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id).populate({
      path: "publishedBy",
      select: "username",
    })

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: "Notice not found",
      })
    }

    // Check if user has access to this notice
    if (
      notice.targetAudience.includes("all") ||
      notice.targetAudience.includes(req.user.role + "s") ||
      notice.publishedBy.toString() === req.user.id.toString()
    ) {
      res.status(200).json({
        success: true,
        data: notice,
      })
    } else {
      res.status(403).json({
        success: false,
        message: "Not authorized to access this notice",
      })
    }
  } catch (error) {
    next(error)
  }
}

// Update notice
export const updateNotice = async (req, res, next) => {
  try {
    const { title, content, category, importance, targetAudience, expiryDate, isActive } = req.body

    // Find notice
    const notice = await Notice.findById(req.params.id)

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: "Notice not found",
      })
    }

    // Check if user is the publisher
    if (notice.publishedBy.toString() !== req.user.id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this notice",
      })
    }

    // Upload new attachments if provided
    let attachments = notice.attachments
    if (req.body.attachments && req.body.attachments.length > 0) {
      const newAttachments = await uploadMultipleImages(req.body.attachments, `hostel_management/notices`)
      attachments = [...attachments, ...newAttachments]
    }

    // Update notice
    const updatedNotice = await Notice.findByIdAndUpdate(
      req.params.id,
      {
        title,
        content,
        category,
        importance,
        targetAudience,
        attachments,
        expiryDate: expiryDate ? new Date(expiryDate) : notice.expiryDate,
        isActive: isActive !== undefined ? isActive : notice.isActive,
      },
      { new: true, runValidators: true },
    )

    res.status(200).json({
      success: true,
      data: updatedNotice,
    })
  } catch (error) {
    next(error)
  }
}

// Delete notice
export const deleteNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id)

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: "Notice not found",
      })
    }

    // Check if user is the publisher or admin
    if (notice.publishedBy.toString() !== req.user.id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this notice",
      })
    }

    await notice.deleteOne()

    res.status(200).json({
      success: true,
      message: "Notice deleted successfully",
    })
  } catch (error) {
    next(error)
  }
}

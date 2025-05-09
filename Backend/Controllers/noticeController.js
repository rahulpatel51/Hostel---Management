import Notice from "../Models/Notice.js";
import { uploadMultipleImages } from "../Config/cloudinary.js";
import { isValidObjectId } from "mongoose";

// Create notice
export const createNotice = async (req, res, next) => {
  try {
    const { title, content, category, importance, targetAudience, expiryDate } = req.body;

    // Validate required fields
    if (!title || !content || !category || !importance || !targetAudience) {
      return res.status(400).json({
        success: false,
        message: "Title, content, category, importance and target audience are required",
      });
    }

    // Validate target audience
    const validAudiences = ["all", "students", "wardens", "staff"];
    if (!validAudiences.includes(targetAudience)) {
      return res.status(400).json({
        success: false,
        message: "Invalid target audience",
      });
    }

    // Upload attachments if provided
    let attachments = [];
    if (req.body.attachments && req.body.attachments.length > 0) {
      try {
        attachments = await uploadMultipleImages(req.body.attachments, `hostel_management/notices`);
      } catch (uploadError) {
        return res.status(500).json({
          success: false,
          message: "Failed to upload attachments",
        });
      }
    }

    // Validate expiry date if provided
    let parsedExpiryDate = null;
    if (expiryDate) {
      parsedExpiryDate = new Date(expiryDate);
      if (isNaN(parsedExpiryDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid expiry date format",
        });
      }
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
      expiryDate: parsedExpiryDate,
    });

    res.status(201).json({
      success: true,
      data: notice,
    });
  } catch (error) {
    console.error("Create notice error:", error);
    next(error);
  }
};

// Get all notices with pagination and filtering
export const getAllNotices = async (req, res, next) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filtering
    const query = { isActive: true };
    
    // Filter by target audience based on user role
    if (req.user.role === "student") {
      query.$or = [{ targetAudience: "all" }, { targetAudience: "students" }];
    } else if (req.user.role === "warden") {
      query.$or = [{ targetAudience: "all" }, { targetAudience: "wardens" }];
    } else if (req.user.role === "staff") {
      query.$or = [{ targetAudience: "all" }, { targetAudience: "staff" }];
    }

    // Additional filters
    if (req.query.category) {
      query.category = req.query.category;
    }
    if (req.query.importance) {
      query.importance = req.query.importance;
    }
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: "i" } },
        { content: { $regex: req.query.search, $options: "i" } },
      ];
    }

    // Get notices with pagination
    const notices = await Notice.find(query)
      .populate({
        path: "publishedBy",
        select: "username profilePicture",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalNotices = await Notice.countDocuments(query);

    res.status(200).json({
      success: true,
      count: notices.length,
      total: totalNotices,
      page,
      pages: Math.ceil(totalNotices / limit),
      data: notices,
    });
  } catch (error) {
    console.error("Get all notices error:", error);
    next(error);
  }
};

// Get notice by ID
export const getNoticeById = async (req, res, next) => {
  try {
    // Validate ID
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notice ID",
      });
    }

    const notice = await Notice.findById(req.params.id).populate({
      path: "publishedBy",
      select: "username profilePicture",
    });

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: "Notice not found",
      });
    }

    // Check if notice is active
    if (!notice.isActive && req.user.role !== "admin" && notice.publishedBy._id.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "This notice is not active",
      });
    }

    // Check if user has access to this notice
    if (
      notice.targetAudience === "all" ||
      notice.targetAudience === req.user.role + "s" ||
      notice.publishedBy._id.toString() === req.user.id.toString() ||
      req.user.role === "admin"
    ) {
      res.status(200).json({
        success: true,
        data: notice,
      });
    } else {
      res.status(403).json({
        success: false,
        message: "Not authorized to access this notice",
      });
    }
  } catch (error) {
    console.error("Get notice by ID error:", error);
    next(error);
  }
};

// Update notice
export const updateNotice = async (req, res, next) => {
  try {
    // Validate ID
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notice ID",
      });
    }

    const { title, content, category, importance, targetAudience, expiryDate, isActive, attachmentsToRemove } = req.body;

    // Find notice
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: "Notice not found",
      });
    }

    // Check if user is authorized to update
    if (notice.publishedBy.toString() !== req.user.id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this notice",
      });
    }

    // Handle attachments removal
    let attachments = [...notice.attachments];
    if (attachmentsToRemove && attachmentsToRemove.length > 0) {
      try {
        await deleteImages(attachmentsToRemove);
        attachments = attachments.filter(
          (attachment) => !attachmentsToRemove.includes(attachment.public_id)
        );
      } catch (deleteError) {
        console.error("Failed to delete attachments:", deleteError);
        return res.status(500).json({
          success: false,
          message: "Failed to remove attachments",
        });
      }
    }

    // Upload new attachments if provided
    if (req.body.attachments && req.body.attachments.length > 0) {
      try {
        const newAttachments = await uploadMultipleImages(
          req.body.attachments,
          `hostel_management/notices`
        );
        attachments = [...attachments, ...newAttachments];
      } catch (uploadError) {
        console.error("Failed to upload new attachments:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload new attachments",
        });
      }
    }

    // Validate expiry date if provided
    let parsedExpiryDate = notice.expiryDate;
    if (expiryDate) {
      parsedExpiryDate = new Date(expiryDate);
      if (isNaN(parsedExpiryDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid expiry date format",
        });
      }
    }

    // Update notice
    const updatedNotice = await Notice.findByIdAndUpdate(
      req.params.id,
      {
        title: title || notice.title,
        content: content || notice.content,
        category: category || notice.category,
        importance: importance || notice.importance,
        targetAudience: targetAudience || notice.targetAudience,
        attachments,
        expiryDate: parsedExpiryDate,
        isActive: isActive !== undefined ? isActive : notice.isActive,
      },
      { new: true, runValidators: true }
    ).populate({
      path: "publishedBy",
      select: "username profilePicture",
    });

    res.status(200).json({
      success: true,
      data: updatedNotice,
    });
  } catch (error) {
    console.error("Update notice error:", error);
    next(error);
  }
};

// Delete notice (soft delete)
export const deleteNotice = async (req, res, next) => {
  try {
    // Validate ID
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notice ID",
      });
    }

    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: "Notice not found",
      });
    }

    // Check if user is authorized to delete
    if (notice.publishedBy.toString() !== req.user.id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this notice",
      });
    }

    // Delete attachments from cloudinary
    if (notice.attachments.length > 0) {
      try {
        const publicIds = notice.attachments.map((attachment) => attachment.public_id);
        await deleteImages(publicIds);
      } catch (deleteError) {
        console.error("Failed to delete attachments:", deleteError);
        // Continue with deletion even if attachments deletion fails
      }
    }

    // Soft delete by setting isActive to false
    // await notice.deleteOne(); // Hard delete
    notice.isActive = false;
    await notice.save();

    res.status(200).json({
      success: true,
      message: "Notice deleted successfully",
    });
  } catch (error) {
    console.error("Delete notice error:", error);
    next(error);
  }
};

// Get notice statistics (for dashboard)
export const getNoticeStats = async (req, res, next) => {
  try {
    const stats = await Notice.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          latest: { $max: "$createdAt" }
        }
      },
      {
        $project: {
          category: "$_id",
          count: 1,
          latest: 1,
          _id: 0
        }
      }
    ]);

    const totalNotices = await Notice.countDocuments({ isActive: true });
    const activeNotices = await Notice.countDocuments({ 
      isActive: true,
      expiryDate: { $gte: new Date() }
    });

    res.status(200).json({
      success: true,
      data: {
        stats,
        totalNotices,
        activeNotices
      }
    });
  } catch (error) {
    console.error("Get notice stats error:", error);
    next(error);
  }
};
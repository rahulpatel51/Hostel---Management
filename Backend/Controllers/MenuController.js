import Menu from "../Models/Menu.js";
import asyncHandler from "../utils/asyncHandler.js";
import ErrorResponse from "../utils/ErrorResponse.js";

// @desc    Get all menu items
// @route   GET /api/menu
// @access  Public
export const getMenuItems = asyncHandler(async (req, res) => {
  const { day } = req.query;
  
  let query = {};
  if (day && day !== 'all') {
    query.day = day;
  }

  const menuItems = await Menu.find(query).sort({ day: 1 });
  
  res.status(200).json({
    success: true,
    count: menuItems.length,
    data: menuItems
  });
});

// @desc    Get single menu item with populated reviews
// @route   GET /api/menu/:id
// @access  Public
export const getMenuItem = asyncHandler(async (req, res) => {
  const menuItem = await Menu.findById(req.params.id)
    .populate('reviews.userId', 'name profilePicture email');

  if (!menuItem) {
    throw new ErrorResponse(`Menu item not found with id of ${req.params.id}`, 404);
  }

  res.status(200).json({
    success: true,
    data: menuItem
  });
});

// @desc    Create new menu item
// @route   POST /api/menu
// @access  Private/Admin
export const createMenuItem = asyncHandler(async (req, res) => {
  const { day, breakfast, lunch, snacks, dinner } = req.body;

  const existingItem = await Menu.findOne({ day });
  if (existingItem) {
    throw new ErrorResponse(`Menu item for ${day} already exists`, 400);
  }

  const menuItem = await Menu.create({
    day,
    breakfast,
    lunch,
    snacks,
    dinner
  });

  res.status(201).json({
    success: true,
    data: menuItem
  });
});

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Private/Admin
export const updateMenuItem = asyncHandler(async (req, res) => {
  let menuItem = await Menu.findById(req.params.id);

  if (!menuItem) {
    throw new ErrorResponse(`Menu item not found with id of ${req.params.id}`, 404);
  }

  if (req.body.day && req.body.day !== menuItem.day) {
    const existingItem = await Menu.findOne({ day: req.body.day });
    if (existingItem) {
      throw new ErrorResponse(`Menu item for ${req.body.day} already exists`, 400);
    }
  }

  menuItem = await Menu.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: menuItem
  });
});

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
// @access  Private/Admin
export const deleteMenuItem = asyncHandler(async (req, res) => {
  const menuItem = await Menu.findById(req.params.id);

  if (!menuItem) {
    throw new ErrorResponse(`Menu item not found with id of ${req.params.id}`, 404);
  }

  await menuItem.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Add review to menu item
// @route   POST /api/menu/:id/reviews
// @access  Private
export const addReview = asyncHandler(async (req, res) => {
  const { comment, rating } = req.body;
  const user = req.user;

  if (!user) {
    throw new ErrorResponse('User not authenticated', 401);
  }

  const menuItem = await Menu.findById(req.params.id);
  if (!menuItem) {
    throw new ErrorResponse(`Menu item not found with id of ${req.params.id}`, 404);
  }

  // Check for existing review
  const existingReview = menuItem.reviews.find(
    review => review.userId.toString() === user._id.toString()
  );

  if (existingReview) {
    throw new ErrorResponse('You have already reviewed this menu item', 400);
  }

  const review = {
    userId: user._id,
    userName: user.name || user.email.split('@')[0],
    avatar: user.profilePicture || "",
    comment,
    rating,
    createdAt: new Date()
  };

  menuItem.reviews.push(review);
  
  // Calculate new average rating
  const totalRatings = menuItem.reviews.reduce((sum, r) => sum + r.rating, 0);
  menuItem.averageRating = totalRatings / menuItem.reviews.length;

  await menuItem.save();

  res.status(201).json({
    success: true,
    data: menuItem
  });
});
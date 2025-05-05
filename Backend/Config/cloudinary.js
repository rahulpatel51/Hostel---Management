import { v2 as cloudinary } from "cloudinary"
import dotenv from "dotenv"

dotenv.config()

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Upload image to Cloudinary
export const uploadImage = async (file, folder = "hostel_management") => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder,
      resource_type: "auto",
    })
    return result.secure_url
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error)
    throw new Error("Image upload failed")
  }
}

// Upload multiple images to Cloudinary
export const uploadMultipleImages = async (files, folder = "hostel_management") => {
  try {
    const uploadPromises = files.map((file) => uploadImage(file, folder))
    return await Promise.all(uploadPromises)
  } catch (error) {
    console.error("Error uploading multiple images to Cloudinary:", error)
    throw new Error("Multiple image upload failed")
  }
}

// Delete image from Cloudinary
export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error)
    throw new Error("Image deletion failed")
  }
}

export default cloudinary

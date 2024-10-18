const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const cloudinary = require("../config/cloudinaryConfig");

// Configure Cloudinary storage for posts media uploads
const postStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith("video");
    
    return {
      folder: isVideo ? "Page_postsVideos" : "Page_postsImages", // Separate folders for images and videos
      resource_type: isVideo ? "video" : "image",                // Define resource type based on file type
      allowed_formats: ["jpg", "jpeg", "png", "mp4", "mov"],      // Allow specific file formats
    };
  },
});

// Multer middleware for handling multiple file uploads
const uploadPostMedia = multer({
  storage: postStorage,
}).fields([
  { name: "media", maxCount: 5 },      // Up to 5 media files (images)
  { name: "coverPhoto", maxCount: 1 }, // 1 cover photo
  { name: "video", maxCount: 1 },      // 1 video file
]);

module.exports = uploadPostMedia;

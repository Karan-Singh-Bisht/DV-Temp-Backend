const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const cloudinary = require("../config/cloudinaryConfig");

// Configure Cloudinary storage for posts media uploads
const postStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder = 'Page_postsImages';
    let resource_type = 'image';

    if (file.mimetype.startsWith("video")) {
      folder = 'Page_postsVideos';
      resource_type = 'video';
    } else if (file.mimetype.startsWith("audio")) {
      folder = 'Page_postsMusic';
      resource_type = 'raw';
    } else if (file.mimetype === "model/gltf-binary" || file.mimetype === "application/octet-stream") {
      folder = 'Page_posts3DFiles';
      resource_type = 'raw';
    }

    return {
      folder: folder,
      resource_type: resource_type,
      allowed_formats: ["jpg", "jpeg", "png", "mp4", "mov", "mp3", "wav", "glb"],
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
  { name: "cad", maxCount: 1 },        // 1 3D model file (GLB)
  { name: "music", maxCount: 1 },      // 1 audio file
]);

module.exports = uploadPostMedia;

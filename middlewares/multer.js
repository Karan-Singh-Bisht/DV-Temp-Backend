const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const cloudinary = require("../config/cloudinaryConfig");

// Configure Cloudinary storage for post media uploads
const postStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder = "Page_postsImages";
    let resource_type = "image";
    let format = null; // Default format is null unless specified

    if (file.mimetype.startsWith("video")) {
      folder = "Page_postsVideos";
      resource_type = "video";
    } else if (file.mimetype.startsWith("audio")) {
      folder = "Page_postsMusic";
      resource_type = "raw";
    } else if (file.mimetype.startsWith("model/")) {
      folder = "Page_posts3DFiles";
      resource_type = "raw";
      format = "glb"; // Default format for 3D files
    }

    console.log(
      `Uploading file of type: ${
        file.mimetype
      } to folder: ${folder} with format: ${format || "default"}`
    );

    return {
      folder,
      resource_type,
      allowed_formats: [
        "jpg",
        "jpeg",
        "png",
        "mp4",
        "mov",
        "mp3",
        "wav",
        "glb",
      ],
      format, // Enforce the file format if specified
    };
  },
});

// Multer middleware for handling multiple file uploads for posts
const uploadPostMedia = multer({
  storage: postStorage,
}).fields([
  { name: "media", maxCount: 5 }, // Up to 5 media files (images)
  { name: "coverPhoto", maxCount: 1 }, // 1 cover photo
  { name: "video", maxCount: 1 }, // 1 video file
  { name: "cad", maxCount: 1 }, // 1 3D model file (GLB)
  { name: "music", maxCount: 1 }, // 1 audio file
]);

// Configure Cloudinary storage for avatar uploads
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const folder = "avatars";
    const resource_type = "image";
    const format = null; // Allow various formats for avatars

    console.log(
      `Uploading avatar of type: ${
        file.mimetype
      } to folder: ${folder} with format: ${format || "default"}`
    );

    return {
      folder,
      resource_type,
      allowed_formats: ["png", "jpg", "jpeg", "mp4", "mov", "mp3"],
      format,
    };
  },
});

// Multer middleware for handling avatar uploads
const uploadAvatarMulter = multer({
  storage: avatarStorage,
}).fields([{ name: "avatar", maxCount: 1 }]);

// Configure Cloudinary storage for story uploads
const storyStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const folder = "story";
    const resource_type = "image";
    const format = "png"; // Enforce PNG format

    console.log(
      `Uploading story of type: ${file.mimetype} to folder: ${folder} with format: ${format}`
    );

    return {
      folder,
      resource_type,
      allowed_formats: ["png"],
      format,
    };
  },
});

const uploadStoryMulter = multer({
  storage: storyStorage, // Use storyStorage instead of avatarStorage
}).fields([{ name: "story", maxCount: 1 }]);

// Configure Cloudinary storage for spotlight collection images
const spotlightStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const folder = "spotlight_collections"; // Folder in Cloudinary
    const resource_type = "image"; // Only images allowed
    const format = "png"; // Default format

    console.log(
      `Uploading Spotlight Collection image of type: ${file.mimetype} to folder: ${folder}`
    );

    return {
      folder,
      resource_type,
      allowed_formats: ["png", "jpg", "jpeg"],
      format,
    };
  },
});

// Multer middleware for handling spotlight collection image uploads
const uploadCollectionMulter = multer({
  storage: spotlightStorage,
}).fields([{ name: "collectionImage", maxCount: 1 }]); // Only 1 image per collection

const UserVerificationDetailsStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "user_verifications", // cloud folder name
    allowed_formats: ["jpg", "png", "jpeg"],
    transformation: [{ width: 800, height: 800, crop: "limit" }],
  },
});

const uploadVerficationDetailsMulter = multer({
  storage: UserVerificationDetailsStorage,
});

const businessVerificationDetailsStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "business_verifications", // cloud folder name
    allowed_formats: ["jpg", "png", "jpeg"],
    transformation: [{ width: 800, height: 800, crop: "limit" }],
  },
});

const uploadBusinessVerificationDetailsMulter = multer({
  storage: businessVerificationDetailsStorage,
});

const dvCardsStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "dv_cards", // cloud folder name
    allowed_formats: ["jpg", "png", "jpeg"],
    transformation: [{ width: 800, height: 800, crop: "limit" }],
  },
});

const uploadDvCardsMulter = multer({
  storage: dvCardsStorage,
});

const creatorVerificationDetailsStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "creator-verifications",
    allowed_formats: ["jpg", "png", "jpeg"],
    transformation: [{ width: 800, height: 800, crop: "limit" }],
  },
});

const uploadCreatorVerificationDetailsMulter = multer({
  storage: creatorVerificationDetailsStorage,
});

module.exports = {
  uploadPostMedia,
  uploadAvatarMulter,
  uploadStoryMulter,
  uploadCollectionMulter,
  uploadVerficationDetailsMulter,
  uploadBusinessVerificationDetailsMulter,
  uploadDvCardsMulter,
  uploadCreatorVerificationDetailsMulter,
};

const Post = require("../models/userPostSchema");
const User = require("../models/User");

const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinaryConfig');

// Cloudinary storage for posts
const postStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder = 'post_media';

    
    if (file.mimetype.startsWith('video')) {
      folder = 'post_videos';
    } else {
      folder = 'post_images';
    }

    return {
      folder: folder,
      resource_type: file.mimetype.startsWith('video') ? 'video' : 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'mp4', 'mov'],
      public_id: `${Date.now()}-${file.originalname}`.replace(/\s+/g, '_'),
    };
  },
});


const uploadPostMedia = multer({
  storage: postStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, 
});


exports.createPost = [
  uploadPostMedia.fields([
    { name: 'media', maxCount: 5 },
    { name: 'coverPhoto', maxCount: 1 },
    { name: 'video', maxCount: 1 }
  ]),
  async (req, res, next) => {
    try {
      const { title, description, location, category, subCategory, isBlog } = req.body;

      const mediaURLs = req.files['media']
        ? req.files['media'].map(file => ({ path: file.path, public_id: file.filename }))
        : [];
      const coverPhotoURL = req.files['coverPhoto']
        ? { path: req.files['coverPhoto'][0].path, public_id: req.files['coverPhoto'][0].filename }
        : null;
      const videoURL = req.files['video']
        ? { path: req.files['video'][0].path, public_id: req.files['video'][0].filename }
        : null;

      
      const newPost = await Post.create({
        user: req.user._id,
        title,
        description,
        media: mediaURLs,
        coverPhoto: coverPhotoURL,
        video: videoURL,
        location,
        category: Array.isArray(category) ? category : [category],
        subCategory: Array.isArray(subCategory) ? subCategory : [subCategory],
        likes: [],
        comments: [],
        shared: [],
        isBlocked: false,
        sensitive: false,
        isBlog,
      });

      res.status(201).json({ message: 'Post created successfully', post: newPost });
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
];




exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("user", "name username profileImg");
    if (!post) return res.status(404).json({ message: "Post not found" });
    
    res.status(200).json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ message: error.message });
  }
};


// Get all user posts
exports.getPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const posts = await Post.find({ user: userId, isBlocked: false }).populate("user", "name username profileImg");
    
    res.status(200).json(posts.length ? posts : { message: "No posts found" });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: error.message });
  }
};






// Update user post
exports.updatePost = [
  uploadPostMedia.fields([
    { name: 'media', maxCount: 5 },
    { name: 'coverPhoto', maxCount: 1 },
    { name: 'video', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { title, description, location, category, subCategory, isBlog } = req.body;

      const post = await Post.findById(req.params.id);
      if (!post) return res.status(404).json({ message: "Post not found" });

      if (post.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "You are not authorized to update this post" });
      }

      
      const mediaURLs = req.files['media']
        ? req.files['media'].map(file => ({ path: file.path, public_id: file.filename }))
        : post.media;

      const coverPhotoURL = req.files['coverPhoto']
        ? { path: req.files['coverPhoto'][0].path, public_id: req.files['coverPhoto'][0].filename }
        : post.coverPhoto;

      const videoURL = req.files['video']
        ? { path: req.files['video'][0].path, public_id: req.files['video'][0].filename }
        : post.video;

     
      const updatedPost = await Post.findByIdAndUpdate(
        req.params.id,
        {
          title,
          description,
          media: mediaURLs,
          coverPhoto: coverPhotoURL,
          video: videoURL,
          location,
          category: Array.isArray(category) ? category : [category],
          subCategory: Array.isArray(subCategory) ? subCategory : [subCategory],
          isBlog,
        },
        { new: true }
      );

      res.status(200).json({ message: "Post updated successfully", post: updatedPost });
    } catch (error) {
      console.error("Error updating post:", error);
      res.status(500).json({ message: error.message });
    }
  },
];



// Delete post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to delete this post" });
    }

    if (post.media) {
      post.media.forEach((file) => {
        cloudinary.uploader.destroy(file.public_id, (error, result) => {
          if (error) console.error("Error deleting media:", error);
        });
      });
    }

    if (post.coverPhoto) {
      cloudinary.uploader.destroy(post.coverPhoto.public_id, (error, result) => {
        if (error) console.error("Error deleting cover photo:", error);
      });
    }

    if (post.video) {
      cloudinary.uploader.destroy(post.video.public_id, (error, result) => {
        if (error) console.error("Error deleting video:", error);
      });
    }

    
    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: error.message });
  }
};



// Like or unlike a post
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.user._id;
    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter(like => !like.equals(userId)); 
      await post.save();
      return res.status(200).json({ message: "Post unliked", post });
    } else {
      post.likes.push(userId);
      await post.save();
      return res.status(200).json({ message: "Post liked", post });
    }
  } catch (error) {
    console.error("Error liking/unliking post:", error);
    res.status(500).json({ message: error.message });
  }
};

const Post = require("../models/userPostSchema");
const User = require("../models/User");

// Create a new post
exports.createPost = async (req, res) => {
  try {
    const { title, description, media, coverPhoto, video, location, category, subCategory, isBlog } = req.body;
    
    const newPost = new Post({
      user: req.user._id,
      title,
      description,
      media,
      coverPhoto,
      video,
      location,
      category,
      subCategory,
      isBlog,
    });

    await newPost.save();
    res.status(201).json({ message: "Post created successfully", post: newPost });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all posts
exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find({ isBlocked: false }).populate("user", "name username profileImg");
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get post by ID
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("user", "name username profileImg");
    if (!post) return res.status(404).json({ message: "Post not found" });
    
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update post
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "Post not found" });

    // Check if the logged-in user is the owner of the post
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to update this post" });
    }

    const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ message: "Post updated successfully", post: updatedPost });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "Post not found" });

    // Check if the logged-in user is the owner of the post
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to delete this post" });
    }

    await post.remove();
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Like a post
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.likes.includes(req.user._id)) {
      return res.status(400).json({ message: "You already liked this post" });
    }

    post.likes.push(req.user._id);
    await post.save();
    res.status(200).json({ message: "Post liked", post });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

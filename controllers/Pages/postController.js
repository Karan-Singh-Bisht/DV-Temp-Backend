const PostModel = require("../../models/Pages/postSchema");
const UserModel = require("../../models/User");

const createHttpError = require("http-errors");
const { model } = require("mongoose");

const createPost = async (req, res) => {
  try {
    const pageId = req.body.pageId;
    const { title, description, location, category, subCategory, isBlog } =
      req.body;

    const mediaURLs = req.files["media"]
      ? req.files["media"].map((file) => ({
          path: file.path,
          public_id: path.filename,
        }))
      : [];
    const coverPhotoURL = req.files["coverPhoto"]
      ? req.files["coverPhoto"][0].path
      : null;
    const videoURL = req.files["video"] ? req.files["video"][0].path : null;

    // if (!title || !category || !subCategory) {
    //   return res.status(400).json({ error: 'Parameters Missing' });
    // }
    if (!title) {
      return res.status(400).json({ error: "something wrong" });
    }
    console.log(...mediaURLs);
    const newPost = await PostModel.create({
      pageId,
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

    const user = await UserModel.findById(pageId).select(
      "name username following followers profession"
    );
    res.status(201).json({
      ...newPost.toObject(),
      userId: {
        ...user.toObject(),
        followingCount: user.following ? user.following.length : 0,
        followersCount: user.followers ? user.followers.length : 0,
      },
    });
  } catch (error) {}
};

module.exports = {
  createPost,
};

const Post = require("../models/userPostSchema");
const cloudinary = require("../config/cloudinaryConfig");
const cron = require("node-cron");
const PostModel = require("../models/Pages/postSchema");
const UserStory = require("../models/userStory");

// ✅ Deletes media files from Cloudinary
const deleteMediaFiles = async (media) => {
  if (!Array.isArray(media)) return;

  for (const file of media) {
    if (file?.public_id) {
      try {
        const result = await cloudinary.uploader.destroy(file.public_id);
        console.log("Media file deleted successfully:", result);
      } catch (error) {
        console.error("Error deleting media file:", error);
      }
    }
  }
};

// ✅ Deletes all assets (media, video, cover photo) of a post
const deletePostAssets = async (post) => {
  await deleteMediaFiles(post.media);

  if (post.coverPhoto?.public_id) {
    try {
      await cloudinary.uploader.destroy(post.coverPhoto.public_id);
      console.log("Cover photo deleted successfully");
    } catch (error) {
      console.error("Error deleting cover photo:", error);
    }
  }

  if (post.video?.public_id) {
    try {
      await cloudinary.uploader.destroy(post.video.public_id);
      console.log("Video deleted successfully");
    } catch (error) {
      console.error("Error deleting video:", error);
    }
  }
};

// ✅ Deletes posts older than a month (if `isDeleted: true`)
const processPosts = async (Model, oneMonthAgo) => {
  const postsToDelete = await Model.find({
    isDeleted: true,
    updatedAt: { $lt: oneMonthAgo },
  });

  for (const post of postsToDelete) {
    await deletePostAssets(post);
    await Model.findByIdAndDelete(post._id);
    console.log(`Post ${post._id} deleted successfully.`);
  }
};

// ✅ Runs every midnight (deletes old posts)
cron.schedule("0 0 * * *", async () => {
  console.log(`[${new Date().toISOString()}] Running delete post cron job...`);
  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    await processPosts(Post, oneMonthAgo);
    await processPosts(PostModel, oneMonthAgo);

    console.log(`[${new Date().toISOString()}] Cron job completed successfully.`);
  } catch (error) {
    console.error("Error running cron job:", error.message);
  }
});

// ✅ Runs every hour (deletes expired stories)
cron.schedule("0 * * * *", async () => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await UserStory.deleteMany({ createdAt: { $lt: twentyFourHoursAgo } });

    console.log(`[${new Date().toISOString()}] Deleted expired stories`);
  } catch (error) {
    console.error("Cron job error:", error.message);
  }
});



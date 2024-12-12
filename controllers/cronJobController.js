const Post = require("../models/userPostSchema");
const cloudinary = require("../config/cloudinaryConfig");
const cron = require("node-cron");
const PostModel = require("../models/Pages/postSchema");

const deleteMediaFiles = async (media) => {
  if (!Array.isArray(media)) return;

  for (const file of media) {
    if (file?.public_id) {
      await cloudinary.uploader.destroy(file.public_id, (error, result) => {
        if (error) {
          console.error("Error deleting media file:", error);
        } else {
          console.log("Media file deleted successfully:", result);
        }
      });
    }
  }
};

const deletePostAssets = async (post) => {
  // Delete media files
  await deleteMediaFiles(post.media);

  // Delete cover photo
  if (post.coverPhoto?.public_id) {
    await cloudinary.uploader.destroy(post.coverPhoto.public_id, (error, result) => {
      if (error) {
        console.error("Error deleting cover photo:", error);
      } else {
        console.log("Cover photo deleted successfully:", result);
      }
    });
  }

  // Delete video
  if (post.video?.public_id) {
    await cloudinary.uploader.destroy(post.video.public_id, (error, result) => {
      if (error) {
        console.error("Error deleting video:", error);
      } else {
        console.log("Video deleted successfully:", result);
      }
    });
  }
};

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

const setupCronJobs = () => {
  console.log("Initializing cron jobs...");

  // Schedule a cron job to run every minute (for testing; change to "0 0 * * *" for daily at midnight)
  cron.schedule("0 0 * * *", async () => {
    console.log("Running delete post cron job...");

    try {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      // Process user posts
      await processPosts(Post, oneMonthAgo);

      // Process page posts
      await processPosts(PostModel, oneMonthAgo);

      console.log("Cron job completed successfully.");
    } catch (error) {
      console.error("Error running cron job:", error.message);
    }
  });

  console.log("Cron job scheduled.");
};

module.exports = { setupCronJobs };

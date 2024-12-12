const Post = require("../models/userPostSchema");
const cloudinary = require("../config/cloudinaryConfig");
const cron = require("node-cron");

const setupCronJobs = () => {
  console.log("Initializing cron jobs...");

  // Schedule a cron job to run every day at midnight
  cron.schedule("* * * * *", async () => {
    console.log("Running delete post cron job...");

    try {
      // Calculate the date one month ago
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      // Fetch posts with `isDeleted: true` and `updatedAt` older than one month
      const postsToDelete = await Post.find({
        isDeleted: true,
        updatedAt: { $lt: oneMonthAgo },
      });

      for (const post of postsToDelete) {
        // Delete media files if they exist and have valid public_ids
        if (Array.isArray(post.media)) {
          for (const file of post.media) {
            if (file?.public_id) {
              cloudinary.uploader.destroy(file.public_id, (error) => {
                if (error) console.error("Error deleting media:", error);
              });
            }
          }
        }

        // Delete cover photo if it exists and has a valid public_id
        if (post.coverPhoto?.public_id) {
          cloudinary.uploader.destroy(post.coverPhoto.public_id, (error) => {
            if (error) console.error("Error deleting cover photo:", error);
          });
        }

        // Delete video if it exists and has a valid public_id
        if (post.video?.public_id) {
          cloudinary.uploader.destroy(post.video.public_id, (error) => {
            if (error) console.error("Error deleting video:", error);
          });
        }

        // Remove the post from the database
        await Post.findByIdAndDelete(post._id);
        console.log(`Post ${post._id} deleted successfully.`);
      }

      console.log("Cron job completed successfully.");
    } catch (error) {
      console.error("Error running cron job:", error.message);
    }
  });

  console.log("Cron job scheduled.");
};

module.exports = { setupCronJobs };

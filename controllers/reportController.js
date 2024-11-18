const User = require("../models/User");
const Friendship = require("../models/friendshipSchema");
const userPost = require("../models/userPostSchema");
const ReportUserPostSchema = require("../models/reportUserPostSchema");


const reportPost = async (req, res) => {
  try {
    const { reason, postId, details } = req.body;
    console.log(req.body);
    
    const userId = req.user._id;

    // Verify if the post exists
    console.log(postId)
    const isPost = await userPost.findById(postId);
    if (!isPost) {
      return res.status(404).json({ message: " No post found" });
    }

    // Create a new report
    const addReport = new ReportUserPostSchema({
      reason,
      postId,
      details,
      reportedBy: userId,
    });

    // Save the report to the database
    const savedReport = await addReport.save();

    if (!savedReport) {
      return res.status(400).json({ message: "Failed to submit report" });
    }

    // Block the user if the report is saved successfully

   if(savedReport){
    return res.status(200).json({ message: "Report submitted successfully" });
   }
  } catch (error) {
    console.error("Error in reporting post:", error.message);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = { reportPost };

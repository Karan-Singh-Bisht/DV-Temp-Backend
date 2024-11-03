const PostModel = require("../../models/Pages/postSchema");
const UserModel = require("../../models/User");
const PostSave= require('../../models/Pages/PostSaveModel')

const savePost = async (req, res) => {
    try {
      const { pageId, saveId } = req.params;
  
      // Check if the saveId is already in savedPosts
      const isSaved = await PostSave.findOne({
        pageId,
        savedPosts: { $in: [saveId] }
      });
  
      if (!isSaved) {
        // If not saved, push the saveId into savedPosts array
        const updatedData = await PostSave.findOneAndUpdate(
          { pageId },
          { $push: { savedPosts: saveId } },
          { new: true, upsert: true } // 'upsert' creates a new document if none exists
        );
  if(updatedData){

    res.status(200).json({ message: 'Post saved successfully', success:true });
  }else{
    res.status(400).json({ message: 'Post saved fail', success:false });

  }
      } else {
   const deletedData = await PostSave.findOneAndUpdate(
  { pageId },
  { $pull: { savedPosts: saveId } },
  { new: true } // 'new: true' returns the modified document
);
if(deletedData){
  
  res.status(200).json({ message: 'Saved Post Deleted successfully' ,success:true});
}else{
  res.status(404).json({ message: 'Post deleted fail' ,success:false});

}

      }
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  const allSavedPost = async (req, res) => {
    try {
      const pageId = req.params.pageId;
      
      // Find the document based on postId
      const allData = await PostSave.findOne({ pageId }).populate('savedPosts');

  
      if (allData) {
        res.status(200).json({data:allData,success:true});
      } else {
        res.status(404).json({ success:false, message: 'No saved posts found for this postId' });
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  const allArchivedPost = async (req, res) => {
    try {
      const { pageId } = req.params;  // Destructure pageId from req.params
      const allArchivedData = await PostModel.find({ pageId, isArchive: true });
      if (allArchivedData) {
        
      return  res.status(200).json({success:true,data:allArchivedData,message:"Fetch successfully"});  // Send the response with archived data
    }else{
        return  res.status(404).json({success:false,message:"fail to fetch archived data"});  // Send the response with archived data

      }
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: "Internal  Server error" });  // Return a response in case of error
    }
  };

  const setToPin = async (req, res) => {
    try {
      const postId = req.params.postId; // Assuming postId is passed in the request params
  
      // Find the post by ID
      const post = await PostModel.findById(postId);
      if (!post) {
        return res.status(404).json({ success: false, message: "Post not found" });
      }
  
      // Count the number of pinned posts
      const pinnedCount = await PostModel.countDocuments({ pinned: true });
  
      // Toggle the pinned status
      if (post.pinned) {
        post.pinned = false;
        // Remove the pinnedAt timestamp when unpinning
      } else {
        // Ensure no more than 3 posts are pinned
        if (pinnedCount >= 3) {
          return res.status(400).json({ success: false, error: "You can only pin up to 3 posts" });
        }
        post.pinned = true;
        post.pinnedAt = new Date(); // Set the timestamp when pinning
      }
  
      // Save the updated post
      await post.save();
  
      res.json({ success: true, message: "Success", post });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ success: false, error: "Internal Server error" });
    }
  };
  
  // Example of fetching posts with pinned posts at the top
  const getPosts = async (req, res) => {
    try {
      const posts = await PostModel.find()
        .sort({ pinned: -1, pinnedAt: -1 }) // Sort pinned posts at the top and by recent pinned date
        .exec();
  
      res.json({ success: true, posts });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ success: false, error: "Internal Server error" });
    }
  };
  

const archivePost = async (req, res) => {
  const postId = req.params.postId;

  try {
    // Find the post by its ID
    const post = await PostModel.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found'  ,success:false});
    }

    // Toggle the isArchive field
    const updatedPost = await PostModel.findByIdAndUpdate(
      postId,
      { isArchive: !post.isArchive }, // Toggle the value
      { new: true } // Return the updated document
    );

    res.status(200).json({
      message: `Post ${updatedPost.isArchive ? 'archived' : 'unarchived'} successfully`,
      success:true
    });
  } catch (error) {
    res.status(500).json({ error: 'Error updating the post', error });
  }
};

const actionLike = async (req, res) => {
  const { postId, userPageId } = req.params;

  try {
    // Check if the post exists and if the user has already liked it
    const post = await PostModel.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if the user has already liked the post
    const isLiked = post.likes.includes(userPageId);

    if (isLiked) {
      // If the post is already liked, remove the like
      await PostModel.findByIdAndUpdate(postId, { $pull: { likes: userPageId } });
      return res.status(200).json({ message: "Like removed" });
    } else {
      // If the post is not liked, add the like
      await PostModel.findByIdAndUpdate(postId, { $push: { likes: userPageId } });
      return res.status(200).json({ message: "Post liked" });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Server error" });
  }
};


  module.exports={
    savePost,
    allSavedPost,
    allArchivedPost,
    setToPin,
    archivePost,
    actionLike
  }
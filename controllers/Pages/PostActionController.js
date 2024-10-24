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
      const allData = await PostSave.findOne({ pageId });
  
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
  
const  PinAction =async(req,res)=>{
  try {

    
    
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ message: "Server error" });  // Return a response in case of error

  }
}
const setToPin = async (req, res) => {
  try {
    const postId = req.params.postId; // Assuming postId is passed in the request params

    const setToPin = await PostModel.findByIdAndUpdate(
      postId,
      [
        {
          $set: {
            isPinned: { $eq: [false, "$isPinned"] }, 
            pinCreatedAt: new Date()
          }
        }
      ],
      { new: true }
    );

    if (setToPin) {
      res.json({ success: true, message:"success" });
    } else {
      res.status(404).json({ success: false, message: "Post not found" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, error: "Internal  Server error" });
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

const actionLike= async(req,res)=>{

  const {postId, userPageId}=req.params
  
  const isPost=await PostModel.findById(postId,{likes:[userPageId]})

  if(isPost){
    const checkLike= await pageModel.findByIdAndUpdate(postId,{$pull:{likes:userPageId}})
  }else{
    
  }


  try {
    
  } catch (error) {
    console.log(error.message)
  }
}

  module.exports={
    savePost,
    allSavedPost,
    allArchivedPost,
    setToPin,
    archivePost,
    actionLike
  }
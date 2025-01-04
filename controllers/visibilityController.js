const User = require("../models/User");
const Visibility = require("../models/visibilityModel");
const Post = require("../models/userPostSchema");

async function CheckVisibily(userId) {
  const getVisiblity = await Post.findOne({ userId });

  const type = getVisiblity.type;

  if (type == "includes") {
  } else if (type == "excludes") {
  } else {
  }
}
const addOrUpdateIncludes = async (req, res) => {
  try {
    const { includesArray, type } = req.body;

    const userId = req.user._id;

    // Validate input
    if (!userId || !type || !includesArray || !Array.isArray(includesArray)) {
      return res.status(400).json({ message: "Invalid input data" });
    }

    let updateFields;
    if (type === "includes") {
      updateFields = { includes: includesArray }; // Replace the includes array
    } else if (type === "excludes") {
      updateFields = { excludes: includesArray }; // Replace the excludes array
    } else {
      return res.status(400).json({ message: "Invalid type value" });
    }

    // Find and update the document or create a new one
    const data = await Visibility.findOneAndUpdate(
      { userId }, // Find criteria
      {
        $set: { ...updateFields, userId, type }, // Replace the array and set other fields
      },
      { upsert: true, new: true } // Create if not found, return updated/new document
    );

    // Respond to the client
    res.status(200).json({
      message: "Visibility entry added/updated successfully",
      data,
    });
  } catch (error) {
    console.error(error.message);
    res
      .status(500)
      .json({ message: "An error occurred while adding/updating the entry" });
  }
};

async function visibilityFilter(postData, userId) {
  try {
    const visibility = await Visibility.findOne({ userId });
    if (!visibility) {
      console.log("No visibility settings found.");
      return postData; // Return the original posts if no settings exist
    }

    let resData = postData;
    let type = visibility.type;
    if (type === "excludes") {
      resData = postData.filter(
        (post) => !visibility.excludes.includes(post.user.toString())
      );
    } else if (type === "includes") {
      resData = postData.filter((post) =>
        visibility.includes.includes(post.user.toString())
      );
    }

    return resData;
  } catch (error) {
    console.log(error.message);
    throw error; // Optionally rethrow the error for the caller to handle
  }
}
async function visibilityPostFilter(post, userId) {
  try {
    const visibility = await Visibility.findOne({ userId });
    if (!visibility) {
      console.log("No visibility settings found.");
      return post; // Return the original post if no settings exist
    }

    let type = visibility.type;

    if (type === "excludes") {
      // Exclude the post if the post's user ID is in the excludes list
      if (visibility.excludes.includes(post.user.toString())) {
        return null; // Return null if the post should be excluded
      }
    } else if (type === "includes") {
      // Include the post only if the post's user ID is in the includes list
      if (!visibility.includes.includes(post.user.toString())) {
        return null; // Return null if the post is not included
      }
    }

    return post; // Return the post if it passes the visibility filter
  } catch (error) {
    console.log(error.message);
    throw error; // Optionally rethrow the error for the caller to handle
  }
}


module.exports = {
  visibilityFilter,
  visibilityPostFilter,
  addOrUpdateIncludes,
};

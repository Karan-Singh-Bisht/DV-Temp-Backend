const UserStory = require("../models/userStory");

const addStory = async (req, res) => {
  try {
    const userId = req.user._id;

    const media = req.files["story"][0]
      ? {
          path: req.files["story"][0].path,
          public_id: req.files["story"].filename,
        }
      : null;

    const addNewStory = new UserStory({
      userId,
      media,
    });
  } catch (error) {
    console.log(error.message);
  }
};
module.exports={addStory}

const mongoose = require('mongoose');

const UserStorySchema = new mongoose.Schema(
  {
    media: {
      path: { type: String, required: true },
      public_id: { type: String, required: true },
    },
    description: { type: String },
    pageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pages", 
      required: true,
    },
    viewedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "Pages" }], // page viewers
  },
  { timestamps: true }
);

const UserStory = mongoose.model('UserStory', UserStorySchema);
module.exports = UserStory;




// const mongoose= require('mongoose')

// const UserStorySchema = new mongoose.Schema(
//   {
//     media: {
//       path: { type: String, required: true },
//       public_id: { type: String, required: true },
//     },
//     description:{
//       type:String,
//     },
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     viewedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//   },
//   { timestamps: true }
// );
// const UserStory=mongoose.model('UserStory',UserStorySchema)
// module.exports=UserStory

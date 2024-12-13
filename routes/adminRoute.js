const express = require('express');
const {login,
    createPost,
    updatePost,
    deletePost,
    getAllFeeds,
    getFeedById,uploadUserAvatar,uploadPageAvatar
}= require('../controllers/adminController/adminController')
const authMiddleware = require('../middlewares/authMiddleware');
const {uploadAvatarMulter}=require('../middlewares/multer')

const router = express.Router();


router.post('/login', login);
// router.post('/login',authMiddleware, login);


// Vision feed routes
router.post('/feed', createPost);
router.put('/feed/:id', updatePost);
router.delete('/feed/:id', deletePost);
router.get('/feeds', getAllFeeds);
router.get('/feed/:id', getFeedById);
router.post("/avatar/upload-avataruser",uploadAvatarMulter, uploadUserAvatar)
router.post("/avatar/upload-avatarpage",uploadAvatarMulter, uploadPageAvatar)

module.exports = router;

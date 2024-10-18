const postController= require('../controllers/Pages/postController')
const express = require('express');
const router = express.Router();

const multer= require('../middlewares/multer')
router.post('/page/createpost',multer,postController.createPost)




module.exports = router;

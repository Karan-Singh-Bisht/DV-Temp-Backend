const express =require('express')

const router= express.Router()



const userStoryController = require('../controllers/userStoryController')
const userAuthMiddleware = require('../middlewares/userAuthMiddleware')


router.post('/users/addnewstory',userAuthMiddleware,userStoryController.addStory)
module.exports=router
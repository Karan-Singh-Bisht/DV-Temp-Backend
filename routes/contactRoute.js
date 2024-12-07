const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactsController');
const userAuthMiddleware = require('../middlewares/userAuthMiddleware');



router.post('/sync-contacts',userAuthMiddleware, contactController.syncContacts);

router.get('/',userAuthMiddleware, contactController.getContacts);

router.get('/getcontactsonly',userAuthMiddleware, contactController.getContactsOnly);

router.get('/namesearch', userAuthMiddleware, contactController.searchByName)

router.get('/phonenumbersearch', userAuthMiddleware, contactController.searchByPhoneNumber)

module.exports = router;

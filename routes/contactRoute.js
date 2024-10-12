const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactsController');


router.post('/sync', contactController.syncContacts);

router.get('/', contactController.getContacts);

module.exports = router;

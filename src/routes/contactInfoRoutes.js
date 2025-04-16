const express = require('express');
const router = express.Router();
const contactInfoController = require('../controllers/contactInfoController');

// Contact Info routes
router.get('/', contactInfoController.getAllContactInfo);
router.get('/:id', contactInfoController.getContactInfoById);
router.post('/', contactInfoController.createContactInfo);
router.put('/:id', contactInfoController.updateContactInfo);
router.delete('/:id', contactInfoController.deleteContactInfo);

module.exports = router;
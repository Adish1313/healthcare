const express = require('express');
const router = express.Router();
const workingHoursController = require('../controllers/workingHoursController');

// Working Hours routes
router.get('/', workingHoursController.getAllWorkingHours);
router.get('/:id', workingHoursController.getWorkingHoursById);
router.post('/', workingHoursController.createWorkingHours);
router.put('/:id', workingHoursController.updateWorkingHours);
router.delete('/:id', workingHoursController.deleteWorkingHours);

module.exports = router;
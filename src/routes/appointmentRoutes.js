const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getDummyAppointments
} = require('../controllers/appointmentController');

// Create
router.post('/', createAppointment);

// Read
router.get('/', getAllAppointments);
router.get('/:id', getAppointmentById);

// Dummy data endpoint
router.get('/dummy', getDummyAppointments);

// Update
router.put('/:id', updateAppointment);

// Delete
router.delete('/:id', deleteAppointment);

module.exports = router;

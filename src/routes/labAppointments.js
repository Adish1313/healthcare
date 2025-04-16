const express = require('express');
const router = express.Router();
const {
    getAllLabAppointments,
    getLabAppointmentById,
    createLabAppointment,
    updateLabAppointment,
    deleteLabAppointment
} = require('../controllers/labAppointmentsController');
const auth = require('../middleware/auth');

// Get all lab appointments
router.get('/', auth, getAllLabAppointments);

// Get a specific lab appointment by ID
router.get('/:id', auth, getLabAppointmentById);

// Create a new lab appointment
router.post('/', auth, createLabAppointment);

// Update a lab appointment
router.put('/:id', auth, updateLabAppointment);

// Delete a lab appointment
router.delete('/:id', auth, deleteLabAppointment);

module.exports = router;
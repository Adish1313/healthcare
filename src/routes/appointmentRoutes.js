const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const appointmentController = require('../controllers/appointmentController');

// Validation middleware for appointment creation/updating
const appointmentValidation = [
  check('full_name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 255 }).withMessage('Name cannot exceed 255 characters'),
  check('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .isLength({ max: 255 }).withMessage('Email cannot exceed 255 characters'),
  check('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .isLength({ max: 255 }).withMessage('Phone number cannot exceed 255 characters'),
  check('doctor_id')
    .notEmpty().withMessage('Doctor is required')
    .isInt().withMessage('Doctor ID must be a number'),
  check('appointment_date')
    .notEmpty().withMessage('Appointment date is required')
    .isDate().withMessage('Please provide a valid date'),
  check('appointment_time')
    .notEmpty().withMessage('Appointment time is required')
    .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/).withMessage('Please provide a valid time (HH:MM:SS)'),
];

// ---- ROUTES WITHOUT AUTHENTICATION ----

// GET all appointments
router.get('/', appointmentController.getAllAppointments);

// GET appointment by ID
router.get('/:id', appointmentController.getAppointmentById);

// GET appointments by doctor ID
router.get('/doctor/:doctorId', appointmentController.getAppointmentsByDoctor);

// CREATE a new appointment
router.post('/', appointmentValidation, appointmentController.createAppointment);

// UPDATE an appointment
router.put('/:id', appointmentValidation, appointmentController.updateAppointment);

// UPDATE appointment status
router.patch('/:id/status', appointmentController.updateAppointmentStatus);

// DELETE an appointment
router.delete('/:id', appointmentController.deleteAppointment);

module.exports = router;

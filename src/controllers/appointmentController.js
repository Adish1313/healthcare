// controllers/appointmentController.js
const Appointment = require('../models/appointment');
const { validationResult } = require('express-validator');

// Get all appointments
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll();
    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// Get appointment by ID
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    
    if (!appointment) { 
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// Get appointments by doctor ID
exports.getAppointmentsByDoctor = async (req, res) => {
  try {
    const appointments = await Appointment.getByDoctorId(req.params.doctorId);
    
    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// Create a new appointment
exports.createAppointment = async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const { doctor_id, appointment_date, appointment_time } = req.body;
    
    // Check if the appointment time is available
    const isAvailable = await Appointment.checkAvailability(doctor_id, appointment_date, appointment_time);
    
    if (!isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'This appointment time is already booked'
      });
    }
    
    const appointment = await Appointment.create(req.body);
    
    res.status(201).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// Update an appointment
exports.updateAppointment = async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    let appointment = await Appointment.getById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // If changing date/time/doctor, check availability
    const { doctor_id, appointment_date, appointment_time } = req.body;
    if (
      doctor_id !== appointment.doctor_id ||
      appointment_date !== appointment.appointment_date ||
      appointment_time !== appointment.appointment_time
    ) {
      const isAvailable = await Appointment.checkAvailability(doctor_id, appointment_date, appointment_time);
      
      if (!isAvailable) {
        return res.status(400).json({
          success: false,
          message: 'This appointment time is already booked'
        });
      }
    }
    
    appointment = await Appointment.update(req.params.id, req.body);
    
    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// Update appointment status
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate status
    if (!['scheduled', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }
    
    const appointment = await Appointment.getById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    const result = await Appointment.updateStatus(req.params.id, status);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// Delete an appointment
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.getById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    const deleted = await Appointment.delete(req.params.id);
    
    if (!deleted) {
      return res.status(400).json({
        success: false,
        message: 'Unable to delete appointment'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};
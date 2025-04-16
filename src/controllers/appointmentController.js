const Appointment = require('../models/appointment');
const Doctor = require('../models/doctor');
const Patient = require('../models/patient');

exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      include: [
        {
          model: Doctor,
          as: 'doctor',
          attributes: ['id', 'name'],
          required: false
        },
        {
          model: Patient,
          as: 'patient',
          attributes: ['id', 'name'],
          required: false
        }
      ]
    });
    console.log('Found appointments:', appointments.length);
    res.json(appointments);
  } catch (error) {
    console.error('Error getting appointments:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        {
          model: Doctor,
          as: 'doctor',
          attributes: ['id', 'name'],
          required: false
        },
        {
          model: Patient,
          as: 'patient',
          attributes: ['id', 'name'],
          required: false
        }
      ]
    });
    if (!appointment) {
      console.log('Appointment not found:', req.params.id);
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (error) {
    console.error('Error getting appointment:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.createAppointment = async (req, res) => {
  try {
    // Validate if doctor and patient exist
    const doctor = await Doctor.findByPk(req.body.doctor_id);
    const patient = await Patient.findByPk(req.body.patient_id);

    if (!doctor) {
      return res.status(400).json({ message: 'Doctor not found' });
    }
    if (!patient) {
      return res.status(400).json({ message: 'Patient not found' });
    }

    const appointment = await Appointment.create({
      patient_id: req.body.patient_id,
      doctor_id: req.body.doctor_id,
      appointment_date: req.body.appointment_date,
      appointment_time: req.body.appointment_time
    });
    
    console.log('Created appointment:', appointment.id);
    
    // Fetch the created appointment with associations
    const newAppointment = await Appointment.findByPk(appointment.id, {
      include: [
        {
          model: Doctor,
          as: 'doctor',
          attributes: ['id', 'name']
        },
        {
          model: Patient,
          as: 'patient',
          attributes: ['id', 'name']
        }
      ]
    });
    
    res.status(201).json(newAppointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) {
      console.log('Appointment not found for update:', req.params.id);
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // If updating doctor_id or patient_id, validate they exist
    if (req.body.doctor_id) {
      const doctor = await Doctor.findByPk(req.body.doctor_id);
      if (!doctor) {
        return res.status(400).json({ message: 'Doctor not found' });
      }
    }
    if (req.body.patient_id) {
      const patient = await Patient.findByPk(req.body.patient_id);
      if (!patient) {
        return res.status(400).json({ message: 'Patient not found' });
      }
    }

    await appointment.update({
      patient_id: req.body.patient_id || appointment.patient_id,
      doctor_id: req.body.doctor_id || appointment.doctor_id,
      appointment_date: req.body.appointment_date || appointment.appointment_date,
      appointment_time: req.body.appointment_time || appointment.appointment_time
    });
    
    console.log('Updated appointment:', appointment.id);

    // Fetch the updated appointment with associations
    const updatedAppointment = await Appointment.findByPk(appointment.id, {
      include: [
        {
          model: Doctor,
          as: 'doctor',
          attributes: ['id', 'name']
        },
        {
          model: Patient,
          as: 'patient',
          attributes: ['id', 'name']
        }
      ]
    });

    res.json(updatedAppointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) {
      console.log('Appointment not found for deletion:', req.params.id);
      return res.status(404).json({ message: 'Appointment not found' });
    }
    await appointment.destroy();
    console.log('Deleted appointment:', req.params.id);
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ message: error.message });
  }
};
const Patient = require('../models/patient');

exports.getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.findAll();
    console.log('Found patients:', patients.length);
    res.json(patients);
  } catch (error) {
    console.error('Error getting patients:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) {
      console.log('Patient not found:', req.params.id);
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json(patient);
  } catch (error) {
    console.error('Error getting patient by id:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.createPatient = async (req, res) => {
  try {
    const patient = await Patient.create(req.body);
    console.log('Created patient:', patient.id);
    res.status(201).json(patient);
  } catch (error) {
    console.error('Error creating patient:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) {
      console.log('Patient not found for update:', req.params.id);
      return res.status(404).json({ message: 'Patient not found' });
    }
    await patient.update(req.body);
    console.log('Updated patient:', patient.id);
    res.json(patient);
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) {
      console.log('Patient not found for deletion:', req.params.id);
      return res.status(404).json({ message: 'Patient not found' });
    }
    await patient.destroy();
    console.log('Deleted patient:', req.params.id);
    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({ message: error.message });
  }
};
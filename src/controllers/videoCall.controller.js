const { Patient, Doctor } = require('../models'); // Adjust import as per your project structure

// Get patient by ID
async function getPatientById(patientId) {
  return await Patient.findByPk(patientId);
}

// Get doctor by ID
async function getDoctorById(doctorId) {
  return await Doctor.findByPk(doctorId);
}

// Deduct wallet balance
async function deductWalletBalance(patientId, amount) {
  const patient = await Patient.findByPk(patientId);
  if (!patient) throw new Error('Patient not found');
  patient.walletBalance -= amount;
  await patient.save();
}

module.exports = {
  getPatientById,
  getDoctorById,
  deductWalletBalance
};
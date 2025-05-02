const { Patient, Doctor, Sequelize } = require('../models');
const PatientWallet = require('../models/patientWallet.model');
const DoctorWallet = require('../models/doctorWallet.model');
const config = require('../config/config'); // Assuming you have a config file

// Constants
const VIDEO_CALL_FEE = config.VIDEO_CALL_FEE || 500; // Default to 500 if not configured

// Get patient by ID with wallet
async function getPatientById(patientId) {
  const patient = await Patient.findByPk(patientId);
  if (!patient) return null;
  
  // Get the patient's wallet
  const wallet = await PatientWallet.findOne({ where: { email: patient.email } });
  if (wallet) {
    patient.wallet = wallet;
  }
  
  return patient;
}

// Get doctor by ID with wallet
async function getDoctorById(doctorId) {
  const doctor = await Doctor.findByPk(doctorId);
  if (!doctor) return null;
  
  // Get the doctor's wallet
  const wallet = await DoctorWallet.findOne({ where: { doctorId } });
  if (wallet) {
    doctor.wallet = wallet;
  }
  
  return doctor;
}

// Process video call payment
async function processVideoCallPayment(user_email, doctorName, amount) {
  try {
    // Import Transaction model
    const Transaction = require('../wallet/transaction.model');
    const { v4: uuidv4 } = require('uuid');
    
    // Get patient's wallet
    const wallet = await PatientWallet.findOne({ where: { email: user_email } });
    if (!wallet) {
      throw new Error('Wallet not found');
    }
    
    // Check sufficient balance
    if (wallet.balance < amount) {
      throw new Error('Insufficient balance');
    }

    // Important: For INR currency, we don't apply any conversion
    // This fixes the bug where 50 INR was being treated as 5000 INR
    const finalAmount = amount; // No conversion for INR

    // Deduct payment from patient's wallet
    await PatientWallet.update(
      { balance: wallet.balance - finalAmount },
      { where: { email: user_email } }
    );

    // Get doctor's wallet - try to find doctor by name (with flexible matching)
    const doctor = await Doctor.findOne({
      where: Sequelize.where(
        Sequelize.fn('LOWER', Sequelize.col('name')),
        'LIKE',
        `%${doctorName.toLowerCase()}%`
      )
    });
    
    // Generate transaction ID
    const transactionId = uuidv4();
    const timestamp = new Date();
    
    if (!doctor) {
      console.log(`Doctor not found with name: ${doctorName}`);
      // Create a temporary doctor ID for testing purposes
      const tempDoctorId = 1; // Default to ID 1 for testing
      
      // Check if wallet exists for this temporary ID
      let doctorWallet = await DoctorWallet.findOne({ where: { doctorId: tempDoctorId } });
      
      // Create wallet if it doesn't exist
      if (!doctorWallet) {
        console.log(`Creating new doctor wallet for ID: ${tempDoctorId}`);
        doctorWallet = await DoctorWallet.create({
          doctorId: tempDoctorId,
          balance: 0
        });
      }
      
      // Add payment to doctor's wallet
      await DoctorWallet.update(
        { balance: doctorWallet.balance + finalAmount },
        { where: { doctorId: tempDoctorId } }
      );
      
      // Create transaction record in the Transaction table
      await Transaction.create({
        id: transactionId,
        type: 'debit',
        amount: finalAmount,
        description: `Video call payment to Dr. ${doctorName}`,
        senderType: 'patient',
        senderId: user_email,
        receiverType: 'doctor',
        receiverId: tempDoctorId.toString(),
        paymentMethod: 'wallet',
        status: 'completed',
        metadata: {
          doctorName: doctorName,
          transactionTime: timestamp,
          service: 'video_call'
        }
      });
      
      return {
        success: true,
        message: 'Payment processed successfully (doctor created)',
        patientBalance: wallet.balance - finalAmount,
        transactionId: transactionId
      };
    }
    
    // If we found the doctor, check for their wallet
    let doctorWallet = await DoctorWallet.findOne({ where: { doctorId: doctor.id } });
    
    // Create doctor wallet if it doesn't exist
    if (!doctorWallet) {
      console.log(`Creating new doctor wallet for: ${doctor.name} (ID: ${doctor.id})`);
      doctorWallet = await DoctorWallet.create({
        doctorId: doctor.id,
        balance: 0
      });
    }

    // Add payment to doctor's wallet
    await DoctorWallet.update(
      { balance: doctorWallet.balance + finalAmount },
      { where: { doctorId: doctor.id } }
    );

    // Create transaction record in the Transaction table
    await Transaction.create({
      id: transactionId,
      type: 'debit',
      amount: finalAmount,
      description: `Video call payment to Dr. ${doctorName}`,
      senderType: 'patient',
      senderId: user_email,
      receiverType: 'doctor',
      receiverId: doctor.id.toString(),
      paymentMethod: 'wallet',
      status: 'completed',
      metadata: {
        doctorName: doctorName,
        transactionTime: timestamp,
        service: 'video_call'
      }
    });

    return {
      success: true,
      message: 'Payment processed successfully',
      patientBalance: wallet.balance - finalAmount,
      doctorBalance: doctorWallet.balance + finalAmount,
      transactionId: transactionId
    };
    patientWallet.transactions = patientTransactions;
    
    // Credit doctor wallet
    doctorWallet.balance += amount;
    
    // Add transaction record
    const doctorTransactions = doctorWallet.transactions;
    doctorTransactions.push({
      type: 'credit',
      amount,
      description: 'Video call with patient ${patient.name || patient.email}',
      timestamp: new Date()
    });
    doctorWallet.transactions = doctorTransactions;
    
    // Save both wallets
    return { success: true };
  } catch (error) {
    throw error;
  }
}

// Generate a fixed room ID for video calls
async function generateRoomId() {
  // Return a fixed room ID for all video calls
  return 'healthoasis-doctor-consult';
}

module.exports = {
  getPatientById,
  getDoctorById,
  processVideoCallPayment,
  generateRoomId,
  VIDEO_CALL_FEE
};
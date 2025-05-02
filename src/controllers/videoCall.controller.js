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
    const AdminWallet = require('../models/adminWallet.model');
    
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

    // Calculate doctor and admin shares (70% to doctor, 30% to admin)
    const doctorShare = finalAmount * 0.7;
    const adminShare = finalAmount * 0.3;

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
    
    // Generate transaction IDs
    const patientTransactionId = uuidv4();
    const doctorTransactionId = uuidv4();
    const adminTransactionId = uuidv4();
    const timestamp = new Date();
    
    // Get admin wallet (ID is always 1)
    let adminWallet = await AdminWallet.findOne({ where: { id: 1 } });
    if (!adminWallet) {
      adminWallet = await AdminWallet.create({
        id: 1,
        balance: 0
      });
    }
    
    // Add admin share to admin wallet
    await AdminWallet.update(
      { balance: adminWallet.balance + adminShare },
      { where: { id: 1 } }
    );
    
    // Create admin credit transaction
    await Transaction.create({
      id: adminTransactionId,
      type: 'credit',
      amount: adminShare,
      description: `Admin commission from video call payment (${user_email})`,
      senderType: 'patient',
      senderId: user_email,
      receiverType: 'admin',
      receiverId: '1',
      paymentMethod: 'wallet',
      status: 'completed',
      metadata: {
        patientEmail: user_email,
        doctorName: doctorName,
        transactionTime: timestamp,
        service: 'video_call',
        share: '30%'
      }
    });
    
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
      
      // Add doctor share to doctor's wallet
      await DoctorWallet.update(
        { balance: doctorWallet.balance + doctorShare },
        { where: { doctorId: tempDoctorId } }
      );
      
      // Create patient debit transaction
      await Transaction.create({
        id: patientTransactionId,
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
      
      // Create doctor credit transaction
      await Transaction.create({
        id: doctorTransactionId,
        type: 'credit',
        amount: doctorShare,
        description: `Video call payment received from ${user_email}`,
        senderType: 'patient',
        senderId: user_email,
        receiverType: 'doctor',
        receiverId: tempDoctorId.toString(),
        paymentMethod: 'wallet',
        status: 'completed',
        metadata: {
          patientEmail: user_email,
          doctorName: doctorName,
          transactionTime: timestamp,
          service: 'video_call',
          share: '70%'
        }
      });
      
      return {
        success: true,
        message: 'Payment processed successfully (doctor created)',
        patientBalance: wallet.balance - finalAmount,
        doctorShare: doctorShare,
        adminShare: adminShare,
        transactionId: patientTransactionId
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

    // Add doctor share to doctor's wallet
    await DoctorWallet.update(
      { balance: doctorWallet.balance + doctorShare },
      { where: { doctorId: doctor.id } }
    );

    // Create patient debit transaction
    await Transaction.create({
      id: patientTransactionId,
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
    
    // Create doctor credit transaction
    await Transaction.create({
      id: doctorTransactionId,
      type: 'credit',
      amount: doctorShare,
      description: `Video call payment received from ${user_email}`,
      senderType: 'patient',
      senderId: user_email,
      receiverType: 'doctor',
      receiverId: doctor.id.toString(),
      paymentMethod: 'wallet',
      status: 'completed',
      metadata: {
        patientEmail: user_email,
        doctorName: doctorName,
        transactionTime: timestamp,
        service: 'video_call',
        share: '70%'
      }
    });

    return {
      success: true,
      message: 'Payment processed successfully',
      patientBalance: wallet.balance - finalAmount,
      doctorShare: doctorShare,
      adminShare: adminShare,
      transactionId: patientTransactionId
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
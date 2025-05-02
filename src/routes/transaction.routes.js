const express = require('express');
const router = express.Router();
const Transaction = require('../wallet/transaction.model');
const Doctor = require('../models/doctor');

// GET /api/transactions/debit?email=user@example.com
// Returns all debit transactions for a patient (video call, etc)
router.get('/debit', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find all debit transactions for this patient
    const transactions = await Transaction.findAll({
      where: {
        senderType: 'patient',
        senderId: email,
        type: 'debit',
      },
      order: [['createdAt', 'DESC']]
    });

    // Enrich with doctor name if possible
    const enriched = await Promise.all(transactions.map(async (txn) => {
      let doctorName = null;
      if (txn.receiverType === 'doctor' && txn.receiverId) {
        const doctor = await Doctor.findOne({ where: { id: txn.receiverId } });
        doctorName = doctor ? doctor.name : null;
      }
      return {
        id: txn.id,
        amount: txn.amount,
        doctorName: doctorName || (txn.metadata && txn.metadata.doctorName) || null,
        time: txn.createdAt,
        description: txn.description,
        service: txn.metadata && txn.metadata.service ? txn.metadata.service : null
      };
    }));

    res.json({ success: true, transactions: enriched });
  } catch (error) {
    console.error('Error fetching debit transactions:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

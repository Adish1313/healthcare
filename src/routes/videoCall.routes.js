const express = require('express');
const router = express.Router();
const { getPatientById, getDoctorById, deductWalletBalance } = require('../controllers/videoCall.controller');

// POST /api/video-call/start
router.post('/start', async (req, res) => {
  try {
    const { patientId, doctorId } = req.body;
    const patient = await getPatientById(patientId);
    const doctor = await getDoctorById(doctorId);

    if (!patient || !doctor) {
      return res.status(404).json({ message: 'Patient or Doctor not found' });
    }
    if (patient.walletBalance < 500) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Deduct 500 from patient's wallet
    await deductWalletBalance(patientId, 500);

    // Generate unique Jitsi room link
    const room = healthoasis-${Date.now()}-${Math.floor(Math.random()*10000)};
    const callLink = https://meet.jit.si/${room};

    // Send email to doctor with the video call link
    await require('../utils/mailer').sendMail({
      to: doctor.email,
      subject: 'New Video Call Request',
      html: <p>You have a new video call request from patient ${patient.email}.<br>Click <a href="${callLink}">here</a> to join the call.</p>
    });

    return res.json({ callLink });
  } catch (error) {
    console.error('Video call error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
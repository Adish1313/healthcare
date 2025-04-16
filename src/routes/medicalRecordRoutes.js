const express = require('express');
const router = express.Router();
const medicalRecordController = require('../controllers/medicalRecordController');
const auth = require('../middleware/auth');

router.get('/', auth, medicalRecordController.getAllMedicalRecords);
router.get('/:id', auth, medicalRecordController.getMedicalRecordById);
router.post('/', auth, medicalRecordController.createMedicalRecord);
router.put('/:id', auth, medicalRecordController.updateMedicalRecord);
router.delete('/:id', auth, medicalRecordController.deleteMedicalRecord);

module.exports = router;
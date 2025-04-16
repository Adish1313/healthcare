const express = require('express');
const router = express.Router();
const {
    getAllVaccines,
    getVaccineById,
    createVaccine,
    updateVaccine,
    deleteVaccine
} = require('../controllers/vaccinesController');
const auth = require('../middleware/auth');

router.get('/', getAllVaccines);
router.get('/:id', getVaccineById);
router.post('/', auth, createVaccine);
router.put('/:id', auth, updateVaccine);
router.delete('/:id', auth, deleteVaccine);

module.exports = router;
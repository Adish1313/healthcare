const express = require('express');
const router = express.Router();
const {
    getAllSteps,
    getStepById,
    createStep,
    updateStep,
    deleteStep
} = require('../controllers/vaccinationProcessController');
const auth = require('../middleware/auth');

router.get('/', getAllSteps);
router.get('/:id', getStepById);
router.post('/', auth, createStep);
router.put('/:id', auth, updateStep);
router.delete('/:id', auth, deleteStep);

module.exports = router;
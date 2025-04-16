const express = require('express');
const router = express.Router();
const {
    getAllSamples,
    getSampleById,
    createSample,
    updateSample,
    deleteSample
} = require('../controllers/Sample');
const auth = require('../middleware/auth');

// Get all samples
router.get('/', auth, getAllSamples);

// Get a specific sample by ID
router.get('/:id', auth, getSampleById);

// Create a new sample
router.post('/', auth, createSample);

// Update a sample
router.put('/:id', auth, updateSample);

// Delete a sample
router.delete('/:id', auth, deleteSample);

module.exports = router;
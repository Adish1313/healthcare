const express = require('express');
const router = express.Router();
const {
    getAllResults,
    getResultById,
    createResult,
    updateResult,
    deleteResult
} = require('../controllers/resultsController');
const auth = require('../middleware/auth');

router.get('/', auth, getAllResults);
router.get('/:id', auth, getResultById);
router.post('/', auth, createResult);
router.put('/:id', auth, updateResult);
router.delete('/:id', auth, deleteResult);

module.exports = router;
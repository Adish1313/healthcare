const express = require('express');
const router = express.Router();
const {
    getAllTests,
    getTestById,
    createTest,
    updateTest,
    deleteTest
} = require('../controllers/labTestsController');
const auth = require('../middleware/auth');

router.get('/', getAllTests);
router.get('/:id', getTestById);
router.post('/', auth, createTest);
router.put('/:id', auth, updateTest);
router.delete('/:id', auth, deleteTest);

module.exports = router;
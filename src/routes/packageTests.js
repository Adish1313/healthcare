const express = require('express');
const router = express.Router();
const {
    getAllPackageTests,
    getPackageTestById,
    createPackageTest,
    updatePackageTest,
    deletePackageTest
} = require('../controllers/packageTestsController');
const auth = require('../middleware/auth');

router.get('/', getAllPackageTests);
router.get('/:id', getPackageTestById);
router.post('/', auth, createPackageTest);
router.put('/:id', auth, updatePackageTest);
router.delete('/:id', auth, deletePackageTest);

module.exports = router;
const express = require('express');
const router = express.Router();
const {
    getAllPackages,
    getPackageById,
    createPackage,
    updatePackage,
    deletePackage
} = require('../controllers/checkupPackagesController');
const auth = require('../middleware/auth');

router.get('/', getAllPackages);
router.get('/:id', getPackageById);
router.post('/', auth, createPackage);
router.put('/:id', auth, updatePackage);
router.delete('/:id', auth, deletePackage);

module.exports = router;
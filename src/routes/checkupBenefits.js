const express = require('express');
const router = express.Router();
const {
    getAllBenefits,
    getBenefitById,
    createBenefit,
    updateBenefit,
    deleteBenefit
} = require('../controllers/checkupBenefitsController');
const auth = require('../middleware/auth');

router.get('/', getAllBenefits);
router.get('/:id', getBenefitById);
router.post('/', auth, createBenefit); // Requires authentication
router.put('/:id', auth, updateBenefit); // Requires authentication
router.delete('/:id', auth, deleteBenefit); // Requires authentication

module.exports = router;
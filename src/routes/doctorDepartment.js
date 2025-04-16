const express = require('express');
const router = express.Router();
const {
    getAllMappings,
    getMappingById,
    createMapping,
    updateMapping,
    deleteMapping
} = require('../controllers/doctorDepartmentController');
const auth = require('../middleware/auth');

router.get('/', getAllMappings);
router.get('/:doctor_id/:department_id', getMappingById);
router.post('/', auth, createMapping);
router.put('/:doctor_id/:department_id', auth, updateMapping);
router.delete('/:doctor_id/:department_id', auth, deleteMapping);

module.exports = router;
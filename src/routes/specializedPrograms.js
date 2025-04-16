const express = require('express');
const router = express.Router();
const {
    getAllPrograms,
    getProgramById,
    createProgram,
    updateProgram,
    deleteProgram
} = require('../controllers/specializedProgramsController');
const auth = require('../middleware/auth');

router.get('/', getAllPrograms);
router.get('/:id', getProgramById);
router.post('/', auth, createProgram);
router.put('/:id', auth, updateProgram);
router.delete('/:id', auth, deleteProgram);

module.exports = router;
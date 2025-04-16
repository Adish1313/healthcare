const SpecializedProgram = require('../models/specializedPrograms');

// Get all programs
const getAllPrograms = async (req, res) => {
    try {
        const programs = await SpecializedProgram.findAll();
        res.status(200).json(programs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a program by ID
const getProgramById = async (req, res) => {
    try {
        const program = await SpecializedProgram.findByPk(req.params.id);
        if (!program) {
            return res.status(404).json({ error: 'Program not found' });
        }
        res.status(200).json(program);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create a new program
const createProgram = async (req, res) => {
    try {
        const { name, description, target_group } = req.body;
        const program = await SpecializedProgram.create({ name, description, target_group });
        res.status(201).json(program);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update an existing program
const updateProgram = async (req, res) => {
    try {
        const program = await SpecializedProgram.findByPk(req.params.id);
        if (!program) {
            return res.status(404).json({ error: 'Program not found' });
        }
        await program.update(req.body);
        res.status(200).json(program);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete a program
const deleteProgram = async (req, res) => {
    try {
        const program = await SpecializedProgram.findByPk(req.params.id);
        if (!program) {
            return res.status(404).json({ error: 'Program not found' });
        }
        await program.destroy();
        res.status(204).send(); // no content
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllPrograms,
    getProgramById,
    createProgram,
    updateProgram,
    deleteProgram
};

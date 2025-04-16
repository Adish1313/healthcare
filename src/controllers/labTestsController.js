const LabTest = require('../models/labTests');

const getAllTests = async (req, res) => {
    try {
        const tests = await LabTest.findAll();
        res.status(200).json(tests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getTestById = async (req, res) => {
    try {
        const test = await LabTest.findByPk(req.params.id);
        if (!test) {
            return res.status(404).json({ error: 'Test not found' });
        }
        res.status(200).json(test);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createTest = async (req, res) => {
    try {
        const { name, category, description, price } = req.body;
        const test = await LabTest.create({ name, category, description, price });
        res.status(201).json(test);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const updateTest = async (req, res) => {
    try {
        const test = await LabTest.findByPk(req.params.id);
        if (!test) {
            return res.status(404).json({ error: 'Test not found' });
        }
        await test.update(req.body);
        res.status(200).json(test);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteTest = async (req, res) => {
    try {
        const test = await LabTest.findByPk(req.params.id);
        if (!test) {
            return res.status(404).json({ error: 'Test not found' });
        }
        await test.destroy();
        res.status(204).json({});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllTests,
    getTestById,
    createTest,
    updateTest,
    deleteTest
};
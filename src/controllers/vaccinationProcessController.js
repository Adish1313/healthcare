const VaccinationProcess = require('../models/vaccinationProcess');

const getAllSteps = async (req, res) => {
    try {
        const steps = await VaccinationProcess.findAll();
        res.status(200).json(steps);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getStepById = async (req, res) => {
    try {
        const step = await VaccinationProcess.findByPk(req.params.id);
        if (!step) {
            return res.status(404).json({ error: 'Step not found' });
        }
        res.status(200).json(step);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createStep = async (req, res) => {
    try {
        const { step, description, step_order } = req.body;
        const newStep = await VaccinationProcess.create({ step, description, step_order });
        res.status(201).json(newStep);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const updateStep = async (req, res) => {
    try {
        const step = await VaccinationProcess.findByPk(req.params.id);
        if (!step) {
            return res.status(404).json({ error: 'Step not found' });
        }
        await step.update(req.body);
        res.status(200).json(step);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteStep = async (req, res) => {
    try {
        const step = await VaccinationProcess.findByPk(req.params.id);
        if (!step) {
            return res.status(404).json({ error: 'Step not found' });
        }
        await step.destroy();
        res.status(204).json({});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllSteps,
    getStepById,
    createStep,
    updateStep,
    deleteStep
};
const CheckupBenefit = require('../models/checkupBenefits');

// Get all checkup benefits
const getAllBenefits = async (req, res) => {
    try {
        const benefits = await CheckupBenefit.findAll();
        res.status(200).json(benefits);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single benefit by ID
const getBenefitById = async (req, res) => {
    try {
        const benefit = await CheckupBenefit.findByPk(req.params.id);
        if (!benefit) {
            return res.status(404).json({ error: 'Benefit not found' });
        }
        res.status(200).json(benefit);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create a new benefit
const createBenefit = async (req, res) => {
    try {
        const { category, description } = req.body;
        const benefit = await CheckupBenefit.create({ category, description });
        res.status(201).json(benefit);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update a benefit
const updateBenefit = async (req, res) => {
    try {
        const benefit = await CheckupBenefit.findByPk(req.params.id);
        if (!benefit) {
            return res.status(404).json({ error: 'Benefit not found' });
        }
        await benefit.update(req.body);
        res.status(200).json(benefit);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete a benefit
const deleteBenefit = async (req, res) => {
    try {
        const benefit = await CheckupBenefit.findByPk(req.params.id);
        if (!benefit) {
            return res.status(404).json({ error: 'Benefit not found' });
        }
        await benefit.destroy();
        res.status(204).json({});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllBenefits,
    getBenefitById,
    createBenefit,
    updateBenefit,
    deleteBenefit
};
const Vaccine = require('../models/vaccines');

const getAllVaccines = async (req, res) => {
    try {
        const vaccines = await Vaccine.findAll({ include: ['VaccinationService'] });
        res.status(200).json(vaccines);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getVaccineById = async (req, res) => {
    try {
        const vaccine = await Vaccine.findByPk(req.params.id, { include: ['VaccinationService'] });
        if (!vaccine) {
            return res.status(404).json({ error: 'Vaccine not found' });
        }
        res.status(200).json(vaccine);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createVaccine = async (req, res) => {
    try {
        const { service_id, name, is_included } = req.body;
        const vaccine = await Vaccine.create({ service_id, name, is_included });
        res.status(201).json(vaccine);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const updateVaccine = async (req, res) => {
    try {
        const vaccine = await Vaccine.findByPk(req.params.id);
        if (!vaccine) {
            return res.status(404).json({ error: 'Vaccine not found' });
        }
        await vaccine.update(req.body);
        res.status(200).json(vaccine);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteVaccine = async (req, res) => {
    try {
        const vaccine = await Vaccine.findByPk(req.params.id);
        if (!vaccine) {
            return res.status(404).json({ error: 'Vaccine not found' });
        }
        await vaccine.destroy();
        res.status(204).json({});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllVaccines,
    getVaccineById,
    createVaccine,
    updateVaccine,
    deleteVaccine
};
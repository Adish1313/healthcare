const VaccinationService = require('../models/vaccinationServices');

const getAllServices = async (req, res) => {
    try {
        const services = await VaccinationService.findAll();
        res.status(200).json(services);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getServiceById = async (req, res) => {
    try {
        const service = await VaccinationService.findByPk(req.params.id);
        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }
        res.status(200).json(service);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createService = async (req, res) => {
    try {
        const { category, description } = req.body;
        const service = await VaccinationService.create({ category, description });
        res.status(201).json(service);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const updateService = async (req, res) => {
    try {
        const service = await VaccinationService.findByPk(req.params.id);
        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }
        await service.update(req.body);
        res.status(200).json(service);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteService = async (req, res) => {
    try {
        const service = await VaccinationService.findByPk(req.params.id);
        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }
        await service.destroy();
        res.status(204).json({});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllServices,
    getServiceById,
    createService,
    updateService,
    deleteService
};
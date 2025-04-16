const CheckupPackage = require('../models/checkupPackages');

const getAllPackages = async (req, res) => {
    try {
        const packages = await CheckupPackage.findAll();
        res.status(200).json(packages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getPackageById = async (req, res) => {
    try {
        const pkg = await CheckupPackage.findByPk(req.params.id);
        if (!pkg) {
            return res.status(404).json({ error: 'Package not found' });
        }
        res.status(200).json(pkg);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createPackage = async (req, res) => {
    try {
        const { name, description, price, popularity } = req.body;
        const pkg = await CheckupPackage.create({ name, description, price, popularity });
        res.status(201).json(pkg);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const updatePackage = async (req, res) => {
    try {
        const pkg = await CheckupPackage.findByPk(req.params.id);
        if (!pkg) {
            return res.status(404).json({ error: 'Package not found' });
        }
        await pkg.update(req.body);
        res.status(200).json(pkg);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deletePackage = async (req, res) => {
    try {
        const pkg = await CheckupPackage.findByPk(req.params.id);
        if (!pkg) {
            return res.status(404).json({ error: 'Package not found' });
        }
        await pkg.destroy();
        res.status(204).json({});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllPackages,
    getPackageById,
    createPackage,
    updatePackage,
    deletePackage
};
const PackageTest = require('../models/packageTests');

const getAllPackageTests = async (req, res) => {
    try {
        const packageTests = await PackageTest.findAll({
            include: ['CheckupPackage', 'LabTest']
        });
        res.status(200).json(packageTests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getPackageTestById = async (req, res) => {
    try {
        const packageTest = await PackageTest.findByPk(req.params.id, {
            include: ['CheckupPackage', 'LabTest']
        });
        if (!packageTest) {
            return res.status(404).json({ error: 'Package test not found' });
        }
        res.status(200).json(packageTest);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createPackageTest = async (req, res) => {
    try {
        const { package_id, test_id } = req.body;
        const packageTest = await PackageTest.create({ package_id, test_id });
        res.status(201).json(packageTest);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const updatePackageTest = async (req, res) => {
    try {
        const packageTest = await PackageTest.findByPk(req.params.id);
        if (!packageTest) {
            return res.status(404).json({ error: 'Package test not found' });
        }
        await packageTest.update(req.body);
        res.status(200).json(packageTest);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deletePackageTest = async (req, res) => {
    try {
        const packageTest = await PackageTest.findByPk(req.params.id);
        if (!packageTest) {
            return res.status(404).json({ error: 'Package test not found' });
        }
        await packageTest.destroy();
        res.status(204).json({});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllPackageTests,
    getPackageTestById,
    createPackageTest,
    updatePackageTest,
    deletePackageTest
};
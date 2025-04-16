const DoctorDepartment = require('../models/doctorDepartment');

const getAllMappings = async (req, res) => {
    try {
        const mappings = await DoctorDepartment.findAll({
            include: ['Doctor', 'Department']
        });
        res.status(200).json(mappings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getMappingById = async (req, res) => {
    try {
        const mapping = await DoctorDepartment.findOne({
            where: { doctor_id: req.params.doctor_id, department_id: req.params.department_id },
            include: ['Doctor', 'Department']
        });
        if (!mapping) {
            return res.status(404).json({ error: 'Mapping not found' });
        }
        res.status(200).json(mapping);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createMapping = async (req, res) => {
    try {
        const { doctor_id, department_id } = req.body;
        const mapping = await DoctorDepartment.create({ doctor_id, department_id });
        res.status(201).json(mapping);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const updateMapping = async (req, res) => {
    try {
        const mapping = await DoctorDepartment.findOne({
            where: { doctor_id: req.params.doctor_id, department_id: req.params.department_id }
        });
        if (!mapping) {
            return res.status(404).json({ error: 'Mapping not found' });
        }
        await mapping.update(req.body);
        res.status(200).json(mapping);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteMapping = async (req, res) => {
    try {
        const mapping = await DoctorDepartment.findOne({
            where: { doctor_id: req.params.doctor_id, department_id: req.params.department_id }
        });
        if (!mapping) {
            return res.status(404).json({ error: 'Mapping not found' });
        }
        await mapping.destroy();
        res.status(204).json({});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllMappings,
    getMappingById,
    createMapping,
    updateMapping,
    deleteMapping
};
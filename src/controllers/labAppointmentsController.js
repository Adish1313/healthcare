const LabAppointment = require('../models/labAppointments');

const getAllLabAppointments = async (req, res) => {
    try {
        const labAppointments = await LabAppointment.findAll({
            include: ['User', 'LabTest', 'CheckupPackage']
        });
        res.status(200).json(labAppointments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getLabAppointmentById = async (req, res) => {
    try {
        const labAppointment = await LabAppointment.findByPk(req.params.id, {
            include: ['User', 'LabTest', 'CheckupPackage']
        });
        if (!labAppointment) {
            return res.status(404).json({ error: 'Lab appointment not found' });
        }
        res.status(200).json(labAppointment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createLabAppointment = async (req, res) => {
    try {
        const { user_id, test_id, package_id, appointment_date, status } = req.body;
        const labAppointment = await LabAppointment.create({
            user_id,
            test_id,
            package_id,
            appointment_date,
            status
        });
        res.status(201).json(labAppointment);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const updateLabAppointment = async (req, res) => {
    try {
        const labAppointment = await LabAppointment.findByPk(req.params.id);
        if (!labAppointment) {
            return res.status(404).json({ error: 'Lab appointment not found' });
        }
        await labAppointment.update(req.body);
        res.status(200).json(labAppointment);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteLabAppointment = async (req, res) => {
    try {
        const labAppointment = await LabAppointment.findByPk(req.params.id);
        if (!labAppointment) {
            return res.status(404).json({ error: 'Lab appointment not found' });
        }
        await labAppointment.destroy();
        res.status(204).json({});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllLabAppointments,
    getLabAppointmentById,
    createLabAppointment,
    updateLabAppointment,
    deleteLabAppointment
};
const Sample = require('../models/Sample');

const getAllSamples = async (req, res) => {
    try {
        const samples = await Sample.findAll({
            include: ['Patient', 'Doctor', 'LabAppointment']
        });
        res.status(200).json(samples);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getSampleById = async (req, res) => {
    try {
        const sample = await Sample.findByPk(req.params.id, {
            include: ['Patient', 'Doctor', 'LabAppointment']
        });
        if (!sample) {
            return res.status(404).json({ error: 'Sample not found' });
        }
        res.status(200).json(sample);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createSample = async (req, res) => {
    try {
        // Restrict to doctors
        if (req.user.role !== 'doctor') {
            return res.status(403).json({ error: 'Only doctors can create samples' });
        }
        const {
            lab_appointment_id,
            patient_id,
            sample_type,
            collection_date,
            collected_by,
            lab_location,
            status,
            notes
        } = req.body;
        const sample = await Sample.create({
            lab_appointment_id,
            patient_id,
            sample_type,
            collection_date,
            collected_by,
            lab_location,
            status,
            notes
        });
        res.status(201).json(sample);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const updateSample = async (req, res) => {
    try {
        // Restrict to doctors
        if (req.user.role !== 'doctor') {
            return res.status(403).json({ error: 'Only doctors can update samples' });
        }
        const sample = await Sample.findByPk(req.params.id);
        if (!sample) {
            return res.status(404).json({ error: 'Sample not found' });
        }
        await sample.update(req.body);
        res.status(200).json(sample);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteSample = async (req, res) => {
    try {
        // Restrict to doctors
        if (req.user.role !== 'doctor') {
            return res.status(403).json({ error: 'Only doctors can delete samples' });
        }
        const sample = await Sample.findByPk(req.params.id);
        if (!sample) {
            return res.status(404).json({ error: 'Sample not found' });
        }
        await sample.destroy();
        res.status(204).json({});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllSamples,
    getSampleById,
    createSample,
    updateSample,
    deleteSample
};
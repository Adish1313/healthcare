const Result = require('../models/results');
const Sample = require('../models/sample');

const getAllResults = async (req, res) => {
    try {
        const { role, id } = req.user;
        let results;
        if (role === 'doctor') {
            results = await Result.findAll({ include: [Sample, 'User'] });
        } else {
            results = await Result.findAll({
                include: [{ model: Sample, where: { patient_id: id } }, 'User']
            });
        }
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getResultById = async (req, res) => {
    try {
        const result = await Result.findByPk(req.params.id, { include: [Sample, 'User'] });
        if (!result) {
            return res.status(404).json({ error: 'Result not found' });
        }
        if (req.user.role === 'patient' && result.Sample.patient_id !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized access' });
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createResult = async (req, res) => {
    try {
        if (req.user.role !== 'doctor') {
            return res.status(403).json({ error: 'Only doctors can create results' });
        }
        const { sample_id, result_data, result_date, accessed_by_user_id, discussed_with_doctor } = req.body;
        const result = await Result.create({
            sample_id,
            result_data,
            result_date,
            accessed_by_user_id,
            discussed_with_doctor
        });
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const updateResult = async (req, res) => {
    try {
        if (req.user.role !== 'doctor') {
            return res.status(403).json({ error: 'Only doctors can update results' });
        }
        const result = await Result.findByPk(req.params.id);
        if (!result) {
            return res.status(404).json({ error: 'Result not found' });
        }
        await result.update(req.body);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteResult = async (req, res) => {
    try {
        if (req.user.role !== 'doctor') {
            return res.status(403).json({ error: 'Only doctors can delete results' });
        }
        const result = await Result.findByPk(req.params.id);
        if (!result) {
            return res.status(404).json({ error: 'Result not found' });
        }
        await result.destroy();
        res.status(204).json({});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllResults,
    getResultById,
    createResult,
    updateResult,
    deleteResult
};
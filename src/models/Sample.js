const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const Sample = sequelize.define('Sample', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    patient_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    collected_by: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    lab_appointment_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    collection_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'samples',
    timestamps: true,
    updatedAt: 'updated_at',
    createdAt: 'created_at'
});

module.exports = Sample;
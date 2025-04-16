const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Result = sequelize.define('Result', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    sample_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    result_data: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    result_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    accessed_by_user_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    discussed_with_doctor: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
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
    tableName: 'results',
    timestamps: true,
    updatedAt: 'updated_at',
    createdAt: 'created_at'
});

module.exports = Result;
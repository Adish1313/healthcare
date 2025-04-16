const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const VaccinationService = require('./vaccinationServices');

const Vaccine = sequelize.define('Vaccine', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    service_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: VaccinationService,
            key: 'id'
        }
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    is_included: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
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
    tableName: 'vaccines',
    timestamps: true,
    updatedAt: 'updated_at',
    createdAt: 'created_at'
});

Vaccine.belongsTo(VaccinationService, { foreignKey: 'service_id' });

module.exports = Vaccine;
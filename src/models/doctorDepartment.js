const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Doctor = require('./doctor');
const Department = require('./department');

const DoctorDepartment = sequelize.define('DoctorDepartment', {
    doctor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: Doctor,
            key: 'id'
        }
    },
    department_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: Department,
            key: 'id'
        }
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
    tableName: 'doctor_department',
    timestamps: true,
    updatedAt: 'updated_at',
    createdAt: 'created_at'
});

DoctorDepartment.belongsTo(Doctor, { foreignKey: 'doctor_id' });
DoctorDepartment.belongsTo(Department, { foreignKey: 'department_id' });

module.exports = DoctorDepartment;
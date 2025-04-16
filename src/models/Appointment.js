const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Doctor = require('./doctor');
const Patient = require('./Patient');

const Appointment = sequelize.define('Appointment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  patient_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'patients',
      key: 'id'
    }
  },
  doctor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'doctors',
      key: 'id'
    }
  },
  appointment_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  appointment_time: {
    type: DataTypes.TIME,
    allowNull: false,
  }
}, {
  tableName: 'appointments',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Define associations
Appointment.belongsTo(Doctor, {
  foreignKey: 'doctor_id',
  as: 'doctor'
});

Appointment.belongsTo(Patient, {
  foreignKey: 'patient_id',
  as: 'patient'
});

module.exports = Appointment;
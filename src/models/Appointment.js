// src/models/appointment.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Appointment = sequelize.define('Appointment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  fullname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  appointment_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  appointment_time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  message: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  doctor_id: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  tableName: 'appointments',
  timestamps: true,
});

module.exports = Appointment;

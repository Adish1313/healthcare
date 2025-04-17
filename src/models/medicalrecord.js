const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MedicalRecord = sequelize.define('MedicalRecord', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  patient_id: {
    type: DataTypes.INTEGER,
  },
  doctor_id: {
    type: DataTypes.INTEGER,
  },
  record_date: {
    type: DataTypes.DATE,
  },
  diagnosis: {
    type: DataTypes.TEXT,
  },
  prescription: {
    type: DataTypes.TEXT,
  },
  notes: {
    type: DataTypes.TEXT,
  }
}, {
  tableName: 'medical_records',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = MedicalRecord;
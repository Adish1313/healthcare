const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PatientWallet = sequelize.define('PatientWallet', {
  email: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  balance: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  transactions: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '[]',
    get() {
      const value = this.getDataValue('transactions');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('transactions', JSON.stringify(value));
    }
  }
}, {
  tableName: 'patient_wallets',
  timestamps: true
});

module.exports = PatientWallet;
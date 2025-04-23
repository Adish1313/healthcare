const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DoctorWallet = sequelize.define('DoctorWallet', {
  doctorId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
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
  tableName: 'doctor_wallets',
  timestamps: true
});

module.exports = DoctorWallet;
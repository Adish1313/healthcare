const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AdminWallet = sequelize.define('AdminWallet', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
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
  tableName: 'admin_wallets',
  timestamps: true
});

module.exports = AdminWallet;
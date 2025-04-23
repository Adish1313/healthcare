const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('credit', 'debit'),
    allowNull: false
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  },
  senderType: {
    type: DataTypes.ENUM('patient', 'doctor', 'admin', 'system'),
    allowNull: false
  },
  senderId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  receiverType: {
    type: DataTypes.ENUM('patient', 'doctor', 'admin', 'system'),
    allowNull: false
  },
  receiverId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed'),
    defaultValue: 'completed',
    allowNull: false
  },
  metadata: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '{}',
    get() {
      const value = this.getDataValue('metadata');
      return value ? JSON.parse(value) : {};
    },
    set(value) {
      this.setDataValue('metadata', JSON.stringify(value));
    }
  }
}, {
  tableName: 'transactions',
  timestamps: true
});

module.exports = Transaction;

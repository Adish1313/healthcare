const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  full_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email_address: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  subject: {
    type: DataTypes.STRING(200),
  },
  message_text: {
    type: DataTypes.TEXT,
  },
  submission_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'messages',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Message;
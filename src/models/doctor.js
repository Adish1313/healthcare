const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Doctor = sequelize.define('Doctor', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  specialization: {
    type: DataTypes.STRING(100),
  },
  email: {
    type: DataTypes.STRING(100),
    unique: true,
  },
  phone: {
    type: DataTypes.STRING(20),
  },
  profile_image_url: {
    type: DataTypes.STRING(255),
  }
}, {
  tableName: 'doctors',
  timestamps: true,
  underscored: true
});

module.exports = Doctor;
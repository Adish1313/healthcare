const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // make sure this is the correct path

const ContactInfo = sequelize.define('ContactInfo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  phone_main: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  phone_emergency: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  email_info: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  email_appointments: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  location_address: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  location_city: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  location_zip: {
    type: DataTypes.STRING(10),
    allowNull: true,
  }
}, {
  tableName: 'contact_info',          // ✅ Ensures correct table mapping
  timestamps: true,                   // ✅ You have created_at and updated_at fields
  createdAt: 'created_at',            // ✅ Map to your DB column names
  updatedAt: 'updated_at'
});

module.exports = ContactInfo;

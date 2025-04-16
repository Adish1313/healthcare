const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WorkingHours = sequelize.define('WorkingHours', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  day_of_week: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  start_time: {
    type: DataTypes.TIME,
  },
  end_time: {
    type: DataTypes.TIME,
  },
  is_emergency_only: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  contact_info_id: {
    type: DataTypes.INTEGER,
  }
});

module.exports = WorkingHours;
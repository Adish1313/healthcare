const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const CheckupPackage = require('./checkupPackages');
const LabTest = require('./labTests');

const PackageTest = sequelize.define('PackageTest', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    package_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: CheckupPackage,
            key: 'id'
        }
    },
    test_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: LabTest,
            key: 'id'
        }
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'package_tests',
    timestamps: true,
    updatedAt: 'updated_at',
    createdAt: 'created_at'
});

PackageTest.belongsTo(CheckupPackage, { foreignKey: 'package_id' });
PackageTest.belongsTo(LabTest, { foreignKey: 'test_id' });

module.exports = PackageTest;
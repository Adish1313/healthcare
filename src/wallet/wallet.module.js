const { Module } = require('@nestjs/common');
const { SequelizeModule } = require('@nestjs/sequelize');
const WalletController = require('./wallet.controller');
const WalletService = require('./wallet.service');
const AdminWallet = require('../models/adminWallet.model');
const DoctorWallet = require('../models/doctorWallet.model');
const PatientWallet = require('../models/patientWallet.model');

@Module({
  imports: [SequelizeModule.forFeature([AdminWallet, DoctorWallet, PatientWallet])],
  controllers: [WalletController],
  providers: [WalletService],
})
class WalletModule {}

module.exports = WalletModule;
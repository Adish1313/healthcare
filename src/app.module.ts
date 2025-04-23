const { Module } = require('@nestjs/common');
const { SequelizeModule } = require('@nestjs/sequelize');
const WalletModule = require('./wallet/wallet.module');
const AdminWallet = require('./models/adminWallet.model');
const DoctorWallet = require('./models/doctorWallet.model');
const PatientWallet = require('./models/patientWallet.model');

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'healthoasis',
      models: [AdminWallet, DoctorWallet, PatientWallet],
      synchronize: true,  // true in development, false in production
    }),
    WalletModule,
  ],
})
class AppModule {}

module.exports = AppModule;
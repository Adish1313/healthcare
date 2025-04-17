const Sample = require('./sample');
const Result = require('./results');
const User = require('./user');
const LabAppointment = require('./labAppointments');
const Patient = require('./patient');
const Doctor = require('./doctor');

const initializeAssociations = () => {
    Sample.belongsTo(Patient, { foreignKey: 'patient_id' });
    Sample.belongsTo(Doctor, { foreignKey: 'collected_by' });
    Sample.belongsTo(LabAppointment, { foreignKey: 'lab_appointment_id' });
    Sample.hasMany(Result, { foreignKey: 'sample_id' });
    Result.belongsTo(Sample, { foreignKey: 'sample_id' });
    Result.belongsTo(User, { foreignKey: 'accessed_by_user_id' });
};

module.exports = initializeAssociations;

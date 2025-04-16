const { Patient, Doctor, Appointment } = require('../models');

async function seedTestData() {
  try {
    // Create test patients
    const patient1 = await Patient.create({
      name: 'John Doe',
      gender: 'Male',
      date_of_birth: '1990-01-15',
      email: 'john.doe@example.com',
      phone: '1234567890',
      address: '123 Main St, City'
    });

    const patient2 = await Patient.create({
      name: 'Jane Smith',
      gender: 'Female',
      date_of_birth: '1985-03-20',
      email: 'jane.smith@example.com',
      phone: '9876543210',
      address: '456 Oak Ave, Town'
    });

    // Create test doctors
    const doctor1 = await Doctor.create({
      name: 'Dr. Sarah Johnson',
      specialization: 'Cardiology',
      email: 'sarah.johnson@hospital.com',
      phone: '5551234567',
      profile_image_url: '[https://example.com/dr-johnson.jpg'](https://example.com/dr-johnson.jpg')
    });

    const doctor2 = await Doctor.create({
      name: 'Dr. Michael Chen',
      specialization: 'Pediatrics',
      email: 'michael.chen@hospital.com',
      phone: '5559876543',
      profile_image_url: '[https://example.com/dr-chen.jpg'](https://example.com/dr-chen.jpg')
    });

    // Create test appointments
    await Appointment.create({
      patient_id: patient1.id,
      doctor_id: doctor1.id,
      appointment_date: '2025-04-15',
      appointment_time: '10:00:00',
      status: 'Scheduled',
      reason_for_visit: 'Annual checkup'
    });

    await Appointment.create({
      patient_id: patient2.id,
      doctor_id: doctor2.id,
      appointment_date: '2025-04-16',
      appointment_time: '14:30:00',
      status: 'Scheduled',
      reason_for_visit: 'Fever and cold'
    });

    console.log('Test data has been seeded successfully!');
  } catch (error) {
    console.error('Error seeding test data:', error);
  }
}

module.exports = seedTestData;
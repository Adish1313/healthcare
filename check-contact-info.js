require('dotenv').config();
const { Sequelize } = require('sequelize');
const ContactInfo = require('.src/models/contactInfo');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    port: process.env.DB_PORT
  }
);

async function checkContactInfo() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    const count = await ContactInfo.count();
    console.log(`Number of contact info records: ${count}`);

    if (count === 0) {
      // Create a sample contact info
      const sampleContact = await ContactInfo.create({
        phone_main: '+1 (555) 123-4567',
        phone_emergency: '+1 (555) 987-6543',
        email_info: 'info@healthcare.com',
        email_appointments: 'appointments@healthcare.com',
        location_address: '123 Healthcare Ave',
        location_city: 'Medical City',
        location_zip: '12345'
      });
      console.log('Created sample contact info:', sampleContact.toJSON());
    } else {
      const allContacts = await ContactInfo.findAll();
      console.log('Existing contact info:', allContacts.map(c => c.toJSON()));
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkContactInfo();

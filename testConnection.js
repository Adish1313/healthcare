const sequelize = require('./src/config/database');

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Connection to database has been established successfully.');
    
    // Get list of all tables
    const [results] = await sequelize.query('SHOW TABLES');
    console.log('\nAvailable tables in database:');
    results.forEach(result => {
      const tableName = Object.values(result)[0];
      console.log(`- ${tableName}`);
    });
    
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  } finally {
    await sequelize.close();
  }
}

testConnection();
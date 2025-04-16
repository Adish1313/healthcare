const mysql = require('mysql2/promise');
require('dotenv').config();

async function testMySQLConnection() {
  try {
    // First try to connect to MySQL server
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      port: 3306
    });
    
    console.log('Successfully connected to MySQL server');
    
    // Try to create the database if it doesn't exist
    await connection.query('CREATE DATABASE IF NOT EXISTS healthcare');
    console.log('Database "healthcare" checked/created');
    
    // Switch to the healthcare database
    await connection.query('USE healthcare');
    console.log('Switched to healthcare database');
    
    // Test a simple query
    const [rows] = await connection.query('SHOW TABLES');
    console.log('Current tables:', rows);
    
    await connection.end();
    console.log('Connection closed successfully');
  } catch (error) {
    console.error('Error:', error);
  }
}

testMySQLConnection();

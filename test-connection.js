require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT
    });
    
    console.log('Successfully connected to MySQL!');
    await connection.end();
  } catch (error) {
    console.error('Error connecting to MySQL:', error);
  }
}

testConnection();

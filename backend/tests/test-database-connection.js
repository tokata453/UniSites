// test-connection.js
require('dotenv').config();
const db = require('../models');
const { sequelize } = db;

async function testConnection() {
  try {
    console.log('🔄 Testing database connection...\n');
    
    // Test authentication
    await sequelize.authenticate();
    
    console.log('✅ Database connection established successfully!\n');
    console.log('Connection Details:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 Database: ${sequelize.config.database}`);
    console.log(`🏠 Host: ${sequelize.config.host}`);
    console.log(`🔌 Port: ${sequelize.config.port || 'default'}`);
    console.log(`🔧 Dialect: ${sequelize.options.dialect}`);
    console.log(`🔐 SSL: ${sequelize.config.dialectOptions?.ssl ? 'Enabled' : 'Disabled'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Test query
    const result = await sequelize.query('SELECT NOW() as current_time');
    console.log('✅ Test query successful');
    console.log(`⏰ Database time: ${result[0][0].current_time}\n`);
    
    console.log('🎉 All connection tests passed!\n');
    
  } catch (error) {
    console.error('❌ Unable to connect to database:\n');
    console.error('Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check your DATABASE_URL in .env file');
    console.error('2. Verify your database is active on Neon');
    console.error('3. Check your internet connection');
    console.error('4. Ensure SSL mode is set to verify-full\n');
  } finally {
    if (sequelize) {
      await sequelize.close();
      console.log('✅ Database connection closed');
    }
  }
}

testConnection();

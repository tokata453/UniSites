// check-models.js
require('dotenv').config();
const db = require('../models');

async function checkModels() {
  try {
    console.log('🔍 Checking your models...\n');
    
    // Test connection
    await db.sequelize.authenticate();
    console.log('✅ Database connected\n');
    
    // List all loaded models
    console.log('📋 Models found in your project:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const modelNames = Object.keys(db).filter(
      key => key !== 'sequelize' && key !== 'Sequelize'
    );
    
    if (modelNames.length === 0) {
      console.log('❌ No models found!');
      console.log('\nYou need to copy the model files to backend/models/\n');
      return;
    }
    
    modelNames.forEach((name, index) => {
      console.log(`${index + 1}. ${name}`);
    });
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Try to sync models to database
    console.log('🔄 Attempting to create tables in database...\n');
    
    await db.sequelize.sync({ force: false, alter: true });
    
    console.log('✅ Database tables created/updated successfully!\n');
    
    // List tables
    const tables = await db.sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
    );
    
    console.log('📊 Tables in your database:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (tables && tables.length > 0) {
      tables.forEach((row, index) => {
        console.log(`${index + 1}. ${row[0]}`);  // ✅ Correct!
      });
    } else {
      console.log('No tables found!');
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('🎉 Setup complete!\n');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nFull error:', error);
  } finally {
    await db.sequelize.close();
  }
}

checkModels();
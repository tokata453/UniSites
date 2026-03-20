'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

const collectModelFiles = (dir) => {
  return fs.readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        return collectModelFiles(fullPath);
      }

      const isModelFile =
        entry.name.indexOf('.') !== 0 &&
        fullPath !== __filename &&
        entry.name.slice(-3) === '.js' &&
        entry.name.indexOf('.test.js') === -1;

      return isModelFile ? [fullPath] : [];
    })
    .sort();
};

// Initialize Sequelize instance (database connection)
let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Import all models in the current dir (and subdirs) and initialize them
collectModelFiles(__dirname).forEach((filePath) => {
  const model = require(filePath)(sequelize, Sequelize.DataTypes);
  db[model.name] = model;
});

// Set up model associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Export the db object containing all models and the Sequelize instance
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

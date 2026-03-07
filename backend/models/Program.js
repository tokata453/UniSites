'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Program extends Model {
    static associate(db) {
      Program.belongsTo(db.University, { foreignKey: 'university_id', as: 'University' });
      Program.belongsTo(db.Faculty, { foreignKey: 'faculty_id', as: 'Faculty' });
      Program.belongsTo(db.Major, { foreignKey: 'major_id', as: 'Major' });
    }
  }

  Program.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    university_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    faculty_id: {
      type: DataTypes.UUID,
    },
    major_id: {
      type: DataTypes.UUID,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    name_km: {
      type: DataTypes.STRING(255),
    },
    degree_level: {
      type: DataTypes.ENUM('associate', 'bachelor', 'master', 'phd', 'certificate', 'diploma'),
    },
    duration_years: {
      type: DataTypes.DECIMAL(3, 1),
    },
    language: {
      type: DataTypes.STRING(50),
      defaultValue: 'English',
    },
    description: {
      type: DataTypes.TEXT,
    },
    tuition_fee: {
      type: DataTypes.INTEGER,
    },
    tuition_currency: {
      type: DataTypes.STRING(10),
      defaultValue: 'USD',
    },
    credits_required: {
      type: DataTypes.INTEGER,
    },
    is_available: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    sequelize,
    modelName: 'Program',
    tableName: 'programs',
    underscored: true,
  });

  return Program;
};

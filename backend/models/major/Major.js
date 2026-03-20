'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Major extends Model {
    static associate(db) {
      Major.hasMany(db.UniversityProgram, { foreignKey: 'major_id', as: 'Programs' });
    }
  }

  Major.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    slug: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    name_km: {
      type: DataTypes.STRING(255),
    },
    description: {
      type: DataTypes.TEXT,
    },
    field_of_study: {
      type: DataTypes.STRING(150),
    },
    icon: {
      type: DataTypes.STRING(20),
    },
    cover_url: {
      type: DataTypes.TEXT,
    },
    career_paths: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    skills_gained: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    related_majors: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    average_salary: {
      type: DataTypes.INTEGER,
    },
    job_demand: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'very_high'),
    },
    is_stem: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    sequelize,
    modelName: 'Major',
    tableName: 'majors',
    underscored: true,
  });

  return Major;
};

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UniversityAdmissionRequirement extends Model {
    static associate(db) {
      UniversityAdmissionRequirement.belongsTo(db.University, { foreignKey: 'university_id', as: 'University' });
      UniversityAdmissionRequirement.belongsTo(db.UniversityProgram, { foreignKey: 'program_id', as: 'Program' });
    }
  }

  UniversityAdmissionRequirement.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    university_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    program_id: {
      type: DataTypes.UUID,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    requirement_type: {
      type: DataTypes.ENUM('document', 'exam', 'language', 'interview', 'other'),
    },
    description: {
      type: DataTypes.TEXT,
    },
    deadline: {
      type: DataTypes.DATEONLY,
    },
    intake_period: {
      type: DataTypes.STRING(100),
    },
    is_mandatory: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  }, {
    sequelize,
    modelName: 'UniversityAdmissionRequirement',
    tableName: 'admission_requirements',
    underscored: true,
  });

  return UniversityAdmissionRequirement;
};

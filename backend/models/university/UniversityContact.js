'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UniversityContact extends Model {
    static associate(db) {
      UniversityContact.belongsTo(db.University, { foreignKey: 'university_id', as: 'University' });
    }
  }

  UniversityContact.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    university_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },
    admission_email: {
      type: DataTypes.STRING(255),
    },
    admission_phone: {
      type: DataTypes.STRING(50),
    },
    admissions_url: {
      type: DataTypes.TEXT,
    },
    programs_url: {
      type: DataTypes.TEXT,
    },
    about_url: {
      type: DataTypes.TEXT,
    },
    general_email: {
      type: DataTypes.STRING(255),
    },
    general_phone: {
      type: DataTypes.STRING(50),
    },
    whatsapp: {
      type: DataTypes.STRING(50),
    },
    telegram: {
      type: DataTypes.STRING(100),
    },
    facebook_page: {
      type: DataTypes.STRING(255),
    },
    instagram: {
      type: DataTypes.STRING(255),
    },
    youtube: {
      type: DataTypes.STRING(255),
    },
    linkedin: {
      type: DataTypes.STRING(255),
    },
    tiktok: {
      type: DataTypes.STRING(255),
    },
    office_hours: {
      type: DataTypes.STRING(255),
    },
    map_embed_url: {
      type: DataTypes.TEXT,
    },
  }, {
    sequelize,
    modelName: 'UniversityContact',
    tableName: 'university_contacts',
    underscored: true,
  });

  return UniversityContact;
};

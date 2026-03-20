'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class OrganizationContact extends Model {
    static associate(db) {
      OrganizationContact.belongsTo(db.Organization, { foreignKey: 'organization_id', as: 'Organization' });
    }
  }

  OrganizationContact.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    organization_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },
    general_email: {
      type: DataTypes.STRING(255),
    },
    general_phone: {
      type: DataTypes.STRING(50),
    },
    contact_person_name: {
      type: DataTypes.STRING(150),
    },
    contact_person_title: {
      type: DataTypes.STRING(150),
    },
    website_url: {
      type: DataTypes.TEXT,
    },
    opportunities_url: {
      type: DataTypes.TEXT,
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
    linkedin: {
      type: DataTypes.STRING(255),
    },
    office_hours: {
      type: DataTypes.STRING(255),
    },
    address: {
      type: DataTypes.TEXT,
    },
    map_embed_url: {
      type: DataTypes.TEXT,
    },
  }, {
    sequelize,
    modelName: 'OrganizationContact',
    tableName: 'organization_contacts',
    underscored: true,
  });

  return OrganizationContact;
};

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Organization extends Model {
    static associate(db) {
      Organization.belongsTo(db.User, { foreignKey: 'owner_id', as: 'Owner' });
      Organization.hasMany(db.Opportunity, { foreignKey: 'organization_id', as: 'Opportunities' });
      Organization.hasMany(db.Conversation, { foreignKey: 'organization_id', as: 'Conversations' });
      Organization.hasMany(db.OrganizationInboxAccess, { foreignKey: 'organization_id', as: 'InboxAccesses', onDelete: 'CASCADE' });
      Organization.hasOne(db.OrganizationContact, { foreignKey: 'organization_id', as: 'Contact', onDelete: 'CASCADE' });
      Organization.hasMany(db.OrganizationGallery, { foreignKey: 'organization_id', as: 'Gallery', onDelete: 'CASCADE' });
      Organization.hasMany(db.OrganizationFAQ, { foreignKey: 'organization_id', as: 'FAQs', onDelete: 'CASCADE' });
      Organization.hasMany(db.OrganizationNews, { foreignKey: 'organization_id', as: 'News', onDelete: 'CASCADE' });
      Organization.hasMany(db.OrganizationEvent, { foreignKey: 'organization_id', as: 'Events', onDelete: 'CASCADE' });
      Organization.hasMany(db.OrganizationReview, { foreignKey: 'organization_id', as: 'Reviews', onDelete: 'CASCADE' });
    }
  }

  Organization.init({
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
    tagline: {
      type: DataTypes.STRING(255),
    },
    category: {
      type: DataTypes.STRING(120),
    },
    industry: {
      type: DataTypes.STRING(120),
    },
    logo_url: {
      type: DataTypes.TEXT,
    },
    cover_url: {
      type: DataTypes.TEXT,
    },
    description: {
      type: DataTypes.TEXT,
    },
    mission: {
      type: DataTypes.TEXT,
    },
    vision: {
      type: DataTypes.TEXT,
    },
    location: {
      type: DataTypes.STRING(255),
    },
    address: {
      type: DataTypes.TEXT,
    },
    founded_year: {
      type: DataTypes.INTEGER,
    },
    team_size: {
      type: DataTypes.STRING(80),
    },
    website_url: {
      type: DataTypes.STRING(255),
    },
    email: {
      type: DataTypes.STRING(255),
    },
    contact_phone: {
      type: DataTypes.STRING(50),
    },
    facebook_url: {
      type: DataTypes.STRING(255),
    },
    telegram_url: {
      type: DataTypes.STRING(255),
    },
    instagram_url: {
      type: DataTypes.STRING(255),
    },
    linkedin_url: {
      type: DataTypes.STRING(255),
    },
    owner_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_approved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_published: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    sequelize,
    modelName: 'Organization',
    tableName: 'organizations',
    underscored: true,
  });

  return Organization;
};

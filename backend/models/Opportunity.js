'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Opportunity extends Model {
    static associate(db) {
      Opportunity.belongsTo(db.University, { foreignKey: 'university_id', as: 'University' });
      Opportunity.belongsTo(db.User, { foreignKey: 'posted_by', as: 'PostedBy' });
      Opportunity.hasMany(db.OpportunityTag, { foreignKey: 'opportunity_id', as: 'Tags', onDelete: 'CASCADE' });
      Opportunity.hasMany(db.OpportunityApplication, { foreignKey: 'opportunity_id', as: 'Applications', onDelete: 'CASCADE' });
    }
  }

  Opportunity.init({
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
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('scholarship', 'internship', 'exchange', 'competition', 'workshop', 'research', 'parttime', 'volunteer'),
      allowNull: false,
    },
    cover_url: {
      type: DataTypes.TEXT,
    },
    deadline: {
      type: DataTypes.DATEONLY,
    },
    start_date: {
      type: DataTypes.DATEONLY,
    },
    end_date: {
      type: DataTypes.DATEONLY,
    },
    eligibility: {
      type: DataTypes.TEXT,
    },
    eligibility_criteria: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    field_of_study: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    country: {
      type: DataTypes.STRING(100),
    },
    location: {
      type: DataTypes.STRING(255),
    },
    is_online: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    university_id: {
      type: DataTypes.UUID,
    },
    posted_by: {
      type: DataTypes.UUID,
    },
    source: {
      type: DataTypes.ENUM('internal', 'external'),
      defaultValue: 'external',
    },
    source_url: {
      type: DataTypes.TEXT,
    },
    application_url: {
      type: DataTypes.TEXT,
    },
    contact_email: {
      type: DataTypes.STRING(255),
    },
    funding_amount: {
      type: DataTypes.STRING(150),
    },
    funding_currency: {
      type: DataTypes.STRING(10),
    },
    is_fully_funded: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_published: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    views_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    applicant_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  }, {
    sequelize,
    modelName: 'Opportunity',
    tableName: 'opportunities',
    underscored: true,
  });

  return Opportunity;
};

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UniversityAnalytics extends Model {
    static associate(db) {
      UniversityAnalytics.belongsTo(db.University, { foreignKey: 'university_id', as: 'University' });
    }
  }

  UniversityAnalytics.init({
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
    total_views: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    monthly_views: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    weekly_views: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    daily_views: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    website_clicks: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    application_clicks: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    contact_clicks: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    opportunity_views: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    gallery_views: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    last_reset_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    sequelize,
    modelName: 'UniversityAnalytics',
    tableName: 'university_analytics',
    underscored: true,
  });

  return UniversityAnalytics;
};

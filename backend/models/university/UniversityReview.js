'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UniversityReview extends Model {
    static associate(db) {
      UniversityReview.belongsTo(db.University, { foreignKey: 'university_id', as: 'University' });
      UniversityReview.belongsTo(db.User, { foreignKey: 'author_id', as: 'Author' });
    }
  }

  UniversityReview.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    university_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    author_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    title: {
      type: DataTypes.STRING(255),
    },
    content: {
      type: DataTypes.TEXT,
    },
    pros: {
      type: DataTypes.TEXT,
    },
    cons: {
      type: DataTypes.TEXT,
    },
    owner_reply: {
      type: DataTypes.TEXT,
    },
    owner_replied_at: {
      type: DataTypes.DATE,
    },
    flagged_for_recheck: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    flag_reason: {
      type: DataTypes.TEXT,
    },
    flagged_at: {
      type: DataTypes.DATE,
    },
    academic_rating: {
      type: DataTypes.INTEGER,
      validate: { min: 1, max: 5 },
    },
    campus_rating: {
      type: DataTypes.INTEGER,
      validate: { min: 1, max: 5 },
    },
    facilities_rating: {
      type: DataTypes.INTEGER,
      validate: { min: 1, max: 5 },
    },
    value_rating: {
      type: DataTypes.INTEGER,
      validate: { min: 1, max: 5 },
    },
    is_verified_student: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_approved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    helpful_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  }, {
    sequelize,
    modelName: 'UniversityReview',
    tableName: 'reviews',
    underscored: true,
  });

  return UniversityReview;
};

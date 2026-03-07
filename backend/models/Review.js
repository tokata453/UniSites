'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    static associate(db) {
      Review.belongsTo(db.University, { foreignKey: 'university_id', as: 'University' });
      Review.belongsTo(db.User, { foreignKey: 'author_id', as: 'Author' });
    }
  }

  Review.init({
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
    modelName: 'Review',
    tableName: 'reviews',
    underscored: true,
  });

  return Review;
};

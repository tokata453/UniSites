'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UniversityTestimonial extends Model {
    static associate(db) {
      UniversityTestimonial.belongsTo(db.University, { foreignKey: 'university_id', as: 'University' });
      UniversityTestimonial.belongsTo(db.User, { foreignKey: 'user_id', as: 'User' });
    }
  }

  UniversityTestimonial.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    university_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    avatar_url: {
      type: DataTypes.TEXT,
    },
    role: {
      type: DataTypes.STRING(150),
    },
    graduation_year: {
      type: DataTypes.INTEGER,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER,
    },
    is_featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_approved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    sequelize,
    modelName: 'UniversityTestimonial',
    tableName: 'university_testimonials',
    underscored: true,
  });

  return UniversityTestimonial;
};

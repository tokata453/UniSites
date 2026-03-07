'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CampusFacility extends Model {
    static associate(db) {
      CampusFacility.belongsTo(db.University, { foreignKey: 'university_id', as: 'University' });
    }
  }

  CampusFacility.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    university_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    icon: {
      type: DataTypes.STRING(100),
    },
    image_url: {
      type: DataTypes.TEXT,
    },
    category: {
      type: DataTypes.ENUM('academic', 'sports', 'recreation', 'housing', 'dining', 'health', 'transport', 'other'),
    },
    is_available: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    sequelize,
    modelName: 'CampusFacility',
    tableName: 'campus_facilities',
    underscored: true,
  });

  return CampusFacility;
};

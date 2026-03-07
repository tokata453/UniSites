'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UniversityGallery extends Model {
    static associate(db) {
      UniversityGallery.belongsTo(db.University, { foreignKey: 'university_id', as: 'University' });
    }
  }

  UniversityGallery.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    university_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    public_id: {
      type: DataTypes.STRING(255),
    },
    caption: {
      type: DataTypes.STRING(255),
    },
    category: {
      type: DataTypes.ENUM('campus', 'facilities', 'events', 'students', 'other'),
      defaultValue: 'campus',
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    is_cover: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    sequelize,
    modelName: 'UniversityGallery',
    tableName: 'university_galleries',
    underscored: true,
  });

  return UniversityGallery;
};

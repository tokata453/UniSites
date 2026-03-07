'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Faculty extends Model {
    static associate(db) {
      Faculty.belongsTo(db.University, { foreignKey: 'university_id', as: 'University' });
      Faculty.hasMany(db.Program, { foreignKey: 'faculty_id', as: 'Programs', onDelete: 'CASCADE' });
    }
  }

  Faculty.init({
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
    name_km: {
      type: DataTypes.STRING(255),
    },
    description: {
      type: DataTypes.TEXT,
    },
    icon_url: {
      type: DataTypes.TEXT,
    },
    dean_name: {
      type: DataTypes.STRING(150),
    },
    established_year: {
      type: DataTypes.INTEGER,
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  }, {
    sequelize,
    modelName: 'Faculty',
    tableName: 'faculties',
    underscored: true,
  });

  return Faculty;
};

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UniversityFAQ extends Model {
    static associate(db) {
      UniversityFAQ.belongsTo(db.University, { foreignKey: 'university_id', as: 'University' });
    }
  }

  UniversityFAQ.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    university_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(100),
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    is_published: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    sequelize,
    modelName: 'UniversityFAQ',
    tableName: 'university_faqs',
    underscored: true,
  });

  return UniversityFAQ;
};

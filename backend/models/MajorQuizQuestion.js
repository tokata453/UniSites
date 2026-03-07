'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class MajorQuizQuestion extends Model {
    static associate(db) {
      // No associations needed
    }
  }

  MajorQuizQuestion.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    // { "A": "I enjoy solving logic puzzles", "B": "I love writing essays" }
    options: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    // { "A": { "computer-science": 3, "engineering": 2 }, "B": { ... } }
    major_weights: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    sequelize,
    modelName: 'MajorQuizQuestion',
    tableName: 'major_quiz_questions',
    underscored: true,
  });

  return MajorQuizQuestion;
};

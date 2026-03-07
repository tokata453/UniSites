'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ForumCategory extends Model {
    static associate(db) {
      ForumCategory.hasMany(db.ForumThread, { foreignKey: 'category_id', as: 'Threads', onDelete: 'CASCADE' });
    }
  }

  ForumCategory.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(150),
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
    },
    icon: {
      type: DataTypes.STRING(100),
    },
    color: {
      type: DataTypes.STRING(20),
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    thread_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    sequelize,
    modelName: 'ForumCategory',
    tableName: 'forum_categories',
    underscored: true,
  });

  return ForumCategory;
};

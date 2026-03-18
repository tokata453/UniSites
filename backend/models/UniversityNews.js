'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UniversityNews extends Model {
    static associate(db) {
      UniversityNews.belongsTo(db.University, { foreignKey: 'university_id', as: 'University' });
      UniversityNews.belongsTo(db.User, { foreignKey: 'author_id', as: 'Author' });
    }
  }

  UniversityNews.init({
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
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(300),
      unique: true,
    },
    excerpt: {
      type: DataTypes.TEXT,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    cover_url: {
      type: DataTypes.TEXT,
    },
    image_urls: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: false,
      defaultValue: [],
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    category: {
      type: DataTypes.STRING(100),
    },
    published_at: {
      type: DataTypes.DATE,
    },
    is_pinned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_published: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    views_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  }, {
    sequelize,
    modelName: 'UniversityNews',
    tableName: 'university_news',
    underscored: true,
  });

  return UniversityNews;
};

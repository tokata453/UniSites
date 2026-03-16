'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ForumThread extends Model {
    static associate(db) {
      ForumThread.belongsTo(db.ForumCategory, { foreignKey: 'category_id', as: 'Category' });
      ForumThread.belongsTo(db.User, { foreignKey: 'author_id', as: 'Author' });
      ForumThread.hasMany(db.ForumReply, { foreignKey: 'thread_id', as: 'Replies', onDelete: 'CASCADE' });
    }
  }

  ForumThread.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    author_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(300),
      unique: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    cover_url: {
      type: DataTypes.TEXT,
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    reply_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    like_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    is_pinned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_locked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_official: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    last_reply_at: {
      type: DataTypes.DATE,
    },
  }, {
    sequelize,
    modelName: 'ForumThread',
    tableName: 'forum_threads',
    underscored: true,
  });

  return ForumThread;
};

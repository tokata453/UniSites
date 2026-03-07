'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ForumReply extends Model {
    static associate(db) {
      ForumReply.belongsTo(db.ForumThread, { foreignKey: 'thread_id', as: 'Thread' });
      ForumReply.belongsTo(db.User, { foreignKey: 'author_id', as: 'Author' });
      ForumReply.hasMany(db.ForumLike, { foreignKey: 'reply_id', as: 'Likes', onDelete: 'CASCADE' });
    }
  }

  ForumReply.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    thread_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    author_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    parent_id: {
      type: DataTypes.UUID,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    like_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    is_official: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_accepted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    sequelize,
    modelName: 'ForumReply',
    tableName: 'forum_replies',
    underscored: true,
  });

  return ForumReply;
};

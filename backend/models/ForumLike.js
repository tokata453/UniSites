'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ForumLike extends Model {
    static associate(db) {
      ForumLike.belongsTo(db.ForumReply, { foreignKey: 'reply_id', as: 'Reply' });
      ForumLike.belongsTo(db.User, { foreignKey: 'user_id', as: 'User' });
    }
  }

  ForumLike.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    reply_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'ForumLike',
    tableName: 'forum_likes',
    underscored: true,
  });

  return ForumLike;
};

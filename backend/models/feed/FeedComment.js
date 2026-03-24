'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FeedComment extends Model {
    static associate(db) {
      FeedComment.belongsTo(db.User, { foreignKey: 'user_id', as: 'Author' });
    }
  }

  FeedComment.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    item_type: {
      type: DataTypes.ENUM('news', 'opportunity', 'event'),
      allowNull: false,
    },
    item_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'FeedComment',
    tableName: 'feed_comments',
    underscored: true,
  });

  return FeedComment;
};

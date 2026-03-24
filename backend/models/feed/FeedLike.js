'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FeedLike extends Model {
    static associate(db) {
      FeedLike.belongsTo(db.User, { foreignKey: 'user_id', as: 'User' });
    }
  }

  FeedLike.init({
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
  }, {
    sequelize,
    modelName: 'FeedLike',
    tableName: 'feed_likes',
    underscored: true,
  });

  return FeedLike;
};

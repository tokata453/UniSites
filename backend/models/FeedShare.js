'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FeedShare extends Model {
    static associate(db) {
      FeedShare.belongsTo(db.User, { foreignKey: 'user_id', as: 'User' });
    }
  }

  FeedShare.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    item_type: {
      type: DataTypes.ENUM('news', 'opportunity'),
      allowNull: false,
    },
    item_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'FeedShare',
    tableName: 'feed_shares',
    underscored: true,
  });

  return FeedShare;
};

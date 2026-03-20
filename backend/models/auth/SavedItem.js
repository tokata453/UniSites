'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SavedItem extends Model {
    static associate(db) {
      SavedItem.belongsTo(db.User, { foreignKey: 'user_id', as: 'User' });
    }
  }

  SavedItem.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    item_type: {
      type: DataTypes.ENUM('university', 'opportunity', 'thread'),
      allowNull: false,
    },
    item_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'SavedItem',
    tableName: 'saved_items',
    underscored: true,
  });

  return SavedItem;
};

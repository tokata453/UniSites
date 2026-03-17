'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Conversation extends Model {
    static associate(db) {
      Conversation.belongsTo(db.User, { foreignKey: 'user_one_id', as: 'UserOne' });
      Conversation.belongsTo(db.User, { foreignKey: 'user_two_id', as: 'UserTwo' });
      Conversation.hasMany(db.Message, { foreignKey: 'conversation_id', as: 'Messages', onDelete: 'CASCADE' });
    }
  }

  Conversation.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_one_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    user_two_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    last_message_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Conversation',
    tableName: 'conversations',
    underscored: true,
  });

  return Conversation;
};

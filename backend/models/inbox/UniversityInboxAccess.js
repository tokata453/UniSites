'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UniversityInboxAccess extends Model {
    static associate(db) {
      UniversityInboxAccess.belongsTo(db.University, { foreignKey: 'university_id', as: 'University' });
      UniversityInboxAccess.belongsTo(db.User, { foreignKey: 'user_id', as: 'User' });
    }
  }

  UniversityInboxAccess.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    university_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    access_role: {
      type: DataTypes.ENUM('member', 'staff', 'admin'),
      allowNull: false,
      defaultValue: 'staff',
    },
  }, {
    sequelize,
    modelName: 'UniversityInboxAccess',
    tableName: 'university_inbox_accesses',
    underscored: true,
  });

  return UniversityInboxAccess;
};

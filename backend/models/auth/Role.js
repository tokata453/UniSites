'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    static associate(db) {
      Role.hasMany(db.User, { foreignKey: 'role_id', as: 'Users' });
    }
  }

  Role.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.ENUM('student', 'owner', 'organization', 'admin'),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING(255),
    },
  }, {
    sequelize,
    modelName: 'Role',
    tableName: 'roles',
    underscored: true,
  });

  return Role;
};

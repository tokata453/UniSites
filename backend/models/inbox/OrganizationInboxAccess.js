'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class OrganizationInboxAccess extends Model {
    static associate(db) {
      OrganizationInboxAccess.belongsTo(db.Organization, { foreignKey: 'organization_id', as: 'Organization' });
      OrganizationInboxAccess.belongsTo(db.User, { foreignKey: 'user_id', as: 'User' });
    }
  }

  OrganizationInboxAccess.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    organization_id: {
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
    modelName: 'OrganizationInboxAccess',
    tableName: 'organization_inbox_accesses',
    underscored: true,
  });

  return OrganizationInboxAccess;
};

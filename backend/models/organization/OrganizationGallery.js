'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class OrganizationGallery extends Model {
    static associate(db) {
      OrganizationGallery.belongsTo(db.Organization, { foreignKey: 'organization_id', as: 'Organization' });
    }
  }

  OrganizationGallery.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    organization_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    public_id: {
      type: DataTypes.STRING(255),
    },
    caption: {
      type: DataTypes.STRING(255),
    },
    category: {
      type: DataTypes.ENUM('office', 'team', 'events', 'programs', 'community', 'other'),
      defaultValue: 'office',
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    is_cover: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    sequelize,
    modelName: 'OrganizationGallery',
    tableName: 'organization_galleries',
    underscored: true,
  });

  return OrganizationGallery;
};

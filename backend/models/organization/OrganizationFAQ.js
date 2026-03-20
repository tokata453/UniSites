'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class OrganizationFAQ extends Model {
    static associate(db) {
      OrganizationFAQ.belongsTo(db.Organization, { foreignKey: 'organization_id', as: 'Organization' });
    }
  }

  OrganizationFAQ.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    organization_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(100),
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    is_published: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    sequelize,
    modelName: 'OrganizationFAQ',
    tableName: 'organization_faqs',
    underscored: true,
  });

  return OrganizationFAQ;
};

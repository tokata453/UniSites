'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class OrganizationReview extends Model {
    static associate(db) {
      OrganizationReview.belongsTo(db.Organization, { foreignKey: 'organization_id', as: 'Organization' });
      OrganizationReview.belongsTo(db.User, { foreignKey: 'author_id', as: 'Author' });
    }
  }

  OrganizationReview.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    organization_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    author_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    title: {
      type: DataTypes.STRING(255),
    },
    content: {
      type: DataTypes.TEXT,
    },
    owner_reply: {
      type: DataTypes.TEXT,
    },
    owner_replied_at: {
      type: DataTypes.DATE,
    },
    is_approved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    helpful_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  }, {
    sequelize,
    modelName: 'OrganizationReview',
    tableName: 'organization_reviews',
    underscored: true,
  });

  return OrganizationReview;
};

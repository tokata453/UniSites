'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class OpportunityTag extends Model {
    static associate(db) {
      OpportunityTag.belongsTo(db.Opportunity, { foreignKey: 'opportunity_id', as: 'Opportunity' });
    }
  }

  OpportunityTag.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    opportunity_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    tag: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'OpportunityTag',
    tableName: 'opportunity_tags',
    underscored: true,
    timestamps: false,
  });

  return OpportunityTag;
};

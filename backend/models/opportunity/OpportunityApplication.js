'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class OpportunityApplication extends Model {
    static associate(db) {
      OpportunityApplication.belongsTo(db.Opportunity, { foreignKey: 'opportunity_id', as: 'Opportunity' });
      OpportunityApplication.belongsTo(db.User, { foreignKey: 'user_id', as: 'User' });
    }
  }

  OpportunityApplication.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    opportunity_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('interested', 'applied', 'accepted', 'rejected'),
      defaultValue: 'interested',
    },
    notes: {
      type: DataTypes.TEXT,
    },
    applied_at: {
      type: DataTypes.DATE,
    },
  }, {
    sequelize,
    modelName: 'OpportunityApplication',
    tableName: 'opportunity_applications',
    underscored: true,
  });

  return OpportunityApplication;
};

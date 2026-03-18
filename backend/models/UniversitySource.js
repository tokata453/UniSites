'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UniversitySource extends Model {
    static associate(db) {
      UniversitySource.belongsTo(db.University, {
        foreignKey: 'university_id',
        as: 'University',
      });
    }
  }

  UniversitySource.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    university_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    source_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    source_type: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'official_website',
    },
    source_url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    external_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    confidence_score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 100,
    },
    import_status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'active',
    },
    last_verified_at: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    raw_payload: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
  }, {
    sequelize,
    modelName: 'UniversitySource',
    tableName: 'university_sources',
    underscored: true,
  });

  return UniversitySource;
};

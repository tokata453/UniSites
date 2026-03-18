'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UniversityEvent extends Model {
    static associate(db) {
      UniversityEvent.belongsTo(db.University, { foreignKey: 'university_id', as: 'University' });
    }
  }

  UniversityEvent.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    university_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    cover_url: {
      type: DataTypes.TEXT,
    },
    image_urls: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: false,
      defaultValue: [],
    },
    event_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATE,
    },
    location: {
      type: DataTypes.STRING(255),
    },
    is_online: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    meeting_url: {
      type: DataTypes.STRING(255),
    },
    registration_url: {
      type: DataTypes.STRING(255),
    },
    registration_deadline: {
      type: DataTypes.DATE,
    },
    max_participants: {
      type: DataTypes.INTEGER,
    },
    type: {
      type: DataTypes.ENUM('open_day', 'seminar', 'workshop', 'graduation', 'sports', 'cultural', 'competition', 'other'),
    },
    is_published: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    sequelize,
    modelName: 'UniversityEvent',
    tableName: 'university_events',
    underscored: true,
  });

  return UniversityEvent;
};

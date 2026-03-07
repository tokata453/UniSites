'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class University extends Model {
    static associate(db) {
      University.belongsTo(db.User, { foreignKey: 'owner_id', as: 'Owner' });
      // University.hasMany(db.UniversityGallery, { foreignKey: 'university_id', as: 'Gallery', onDelete: 'CASCADE' });
      // University.hasMany(db.Faculty, { foreignKey: 'university_id', as: 'Faculties', onDelete: 'CASCADE' });
      // University.hasMany(db.Program, { foreignKey: 'university_id', as: 'Programs', onDelete: 'CASCADE' });
      // University.hasMany(db.AdmissionRequirement, { foreignKey: 'university_id', as: 'AdmissionRequirements', onDelete: 'CASCADE' });
      // University.hasMany(db.CampusFacility, { foreignKey: 'university_id', as: 'CampusFacilities', onDelete: 'CASCADE' });
      // University.hasMany(db.UniversityNews, { foreignKey: 'university_id', as: 'News', onDelete: 'CASCADE' });
      // University.hasMany(db.UniversityEvent, { foreignKey: 'university_id', as: 'Events', onDelete: 'CASCADE' });
      // University.hasMany(db.UniversityTestimonial, { foreignKey: 'university_id', as: 'Testimonials', onDelete: 'CASCADE' });
      // University.hasMany(db.UniversityFAQ, { foreignKey: 'university_id', as: 'FAQs', onDelete: 'CASCADE' });
      // University.hasOne(db.UniversityContact, { foreignKey: 'university_id', as: 'Contact', onDelete: 'CASCADE' });
      // University.hasOne(db.UniversityAnalytics, { foreignKey: 'university_id', as: 'Analytics', onDelete: 'CASCADE' });
      University.hasMany(db.Review, { foreignKey: 'university_id', as: 'Reviews', onDelete: 'CASCADE' });
      // University.hasMany(db.Opportunity, { foreignKey: 'university_id', as: 'Opportunities' });
    }
  }

  University.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    slug: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    name_km: {
      type: DataTypes.STRING(255),
    },
    logo_url: {
      type: DataTypes.TEXT,
    },
    cover_url: {
      type: DataTypes.TEXT,
    },
    description: {
      type: DataTypes.TEXT,
    },
    description_km: {
      type: DataTypes.TEXT,
    },
    type: {
      type: DataTypes.ENUM('public', 'private', 'international'),
    },
    location: {
      type: DataTypes.STRING(255),
    },
    province: {
      type: DataTypes.STRING(100),
    },
    address: {
      type: DataTypes.TEXT,
    },
    lat: {
      type: DataTypes.DECIMAL(10, 8),
    },
    lng: {
      type: DataTypes.DECIMAL(11, 8),
    },
    tuition_min: {
      type: DataTypes.INTEGER,
    },
    tuition_max: {
      type: DataTypes.INTEGER,
    },
    tuition_currency: {
      type: DataTypes.STRING(10),
      defaultValue: 'USD',
    },
    founded_year: {
      type: DataTypes.INTEGER,
    },
    student_count: {
      type: DataTypes.INTEGER,
    },
    faculty_count: {
      type: DataTypes.INTEGER,
    },
    program_count: {
      type: DataTypes.INTEGER,
    },
    accreditation: {
      type: DataTypes.STRING(255),
    },
    ranking_local: {
      type: DataTypes.INTEGER,
    },
    ranking_global: {
      type: DataTypes.INTEGER,
    },
    website_url: {
      type: DataTypes.STRING(255),
    },
    email: {
      type: DataTypes.STRING(255),
    },
    phone: {
      type: DataTypes.STRING(50),
    },
    facebook_url: {
      type: DataTypes.STRING(255),
    },
    telegram_url: {
      type: DataTypes.STRING(255),
    },
    instagram_url: {
      type: DataTypes.STRING(255),
    },
    youtube_url: {
      type: DataTypes.STRING(255),
    },
    linkedin_url: {
      type: DataTypes.STRING(255),
    },
    tiktok_url: {
      type: DataTypes.STRING(255),
    },
    owner_id: {
      type: DataTypes.UUID,
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_published: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    scholarship_available: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    dormitory_available: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    international_students: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    views_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    rating_avg: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0.00,
    },
    review_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    meta_title: {
      type: DataTypes.STRING(255),
    },
    meta_description: {
      type: DataTypes.TEXT,
    },
  }, {
    sequelize,
    modelName: 'University',
    tableName: 'universities',
    underscored: true,
  });

  return University;
};

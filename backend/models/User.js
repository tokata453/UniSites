'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    // Instance method — use in login to verify submitted password
    async verifyPassword(plainPassword) {
      if (!this.password) return false;
      return bcrypt.compare(plainPassword, this.password);
    }
    // Method to hide password in JSON responses
    toJSON() {
      const values = Object.assign({}, this.get());
      delete values.password;
      return values;
    }

    static associate(db) {
      User.belongsTo(db.Role, { foreignKey: 'role_id', as: 'Role' });
      User.hasMany(db.University, { foreignKey: 'owner_id', as: 'OwnedUniversities' });
      User.hasMany(db.UniversityNews, { foreignKey: 'author_id', as: 'AuthoredNews' });
      User.hasMany(db.UniversityTestimonial, { foreignKey: 'user_id', as: 'Testimonials' });
      User.hasMany(db.Opportunity, { foreignKey: 'posted_by', as: 'PostedOpportunities' });
      User.hasMany(db.OpportunityApplication, { foreignKey: 'user_id', as: 'Applications' });
      User.hasMany(db.ForumThread, { foreignKey: 'author_id', as: 'Threads' });
      User.hasMany(db.ForumReply, { foreignKey: 'author_id', as: 'Replies' });
      User.hasMany(db.ForumLike, { foreignKey: 'user_id', as: 'Likes' });
      User.hasMany(db.Review, { foreignKey: 'author_id', as: 'Reviews' });
      User.hasMany(db.Notification, { foreignKey: 'user_id', as: 'Notifications' });
      User.hasMany(db.SavedItem, { foreignKey: 'user_id', as: 'SavedItems' });
    }
  }

  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      unique: true,
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.STRING(255),
      // Only required when provider is 'local'
    },
    avatar_url: {
      type: DataTypes.TEXT,
    },
    provider: {
      type: DataTypes.ENUM('google', 'facebook', 'local'),
      allowNull: false,
    },
    provider_id: {
      type: DataTypes.STRING(255),
    },
    role_id: {
      type: DataTypes.INTEGER,
    },
    bio: {
      type: DataTypes.TEXT,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    underscored: true,
    defaultScope: {
      // Never return password by default
      attributes: { exclude: ['password'] },
    },
    scopes: {
      // Use User.scope('withPassword') when you need it (e.g. login)
      withPassword: { attributes: {} },
    },
    hooks: {
      // Auto-hash password before create or update
      beforeSave: async (user) => {
        if (user.changed('password') && user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
    },
  });

  return User;
};
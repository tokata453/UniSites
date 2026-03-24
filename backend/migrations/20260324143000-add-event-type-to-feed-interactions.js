'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query('ALTER TYPE "enum_feed_likes_item_type" ADD VALUE IF NOT EXISTS \'event\';');
    await queryInterface.sequelize.query('ALTER TYPE "enum_feed_comments_item_type" ADD VALUE IF NOT EXISTS \'event\';');
    await queryInterface.sequelize.query('ALTER TYPE "enum_feed_shares_item_type" ADD VALUE IF NOT EXISTS \'event\';');
  },

  async down() {
    // Enum rollback omitted intentionally.
  },
};

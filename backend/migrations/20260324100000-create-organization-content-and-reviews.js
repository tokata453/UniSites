'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('organization_news', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false,
      },
      organization_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'organizations', key: 'id' },
        onDelete: 'CASCADE',
      },
      author_id: {
        type: Sequelize.UUID,
        references: { model: 'users', key: 'id' },
        onDelete: 'SET NULL',
      },
      title: { type: Sequelize.STRING(255), allowNull: false },
      slug: { type: Sequelize.STRING(300), unique: true },
      excerpt: { type: Sequelize.TEXT },
      content: { type: Sequelize.TEXT, allowNull: false },
      cover_url: { type: Sequelize.TEXT },
      image_urls: { type: Sequelize.ARRAY(Sequelize.TEXT), allowNull: false, defaultValue: [] },
      tags: { type: Sequelize.ARRAY(Sequelize.STRING), defaultValue: [] },
      category: { type: Sequelize.STRING(100) },
      published_at: { type: Sequelize.DATE },
      is_pinned: { type: Sequelize.BOOLEAN, defaultValue: false },
      is_published: { type: Sequelize.BOOLEAN, defaultValue: false },
      views_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.createTable('organization_events', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false,
      },
      organization_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'organizations', key: 'id' },
        onDelete: 'CASCADE',
      },
      title: { type: Sequelize.STRING(255), allowNull: false },
      description: { type: Sequelize.TEXT },
      cover_url: { type: Sequelize.TEXT },
      image_urls: { type: Sequelize.ARRAY(Sequelize.TEXT), allowNull: false, defaultValue: [] },
      event_date: { type: Sequelize.DATE, allowNull: false },
      end_date: { type: Sequelize.DATE },
      location: { type: Sequelize.STRING(255) },
      is_online: { type: Sequelize.BOOLEAN, defaultValue: false },
      meeting_url: { type: Sequelize.STRING(255) },
      registration_url: { type: Sequelize.STRING(255) },
      registration_deadline: { type: Sequelize.DATE },
      max_participants: { type: Sequelize.INTEGER },
      type: {
        type: Sequelize.ENUM('open_day', 'seminar', 'workshop', 'graduation', 'sports', 'cultural', 'competition', 'other'),
        defaultValue: 'other',
      },
      is_published: { type: Sequelize.BOOLEAN, defaultValue: false },
      is_featured: { type: Sequelize.BOOLEAN, defaultValue: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.createTable('organization_reviews', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false,
      },
      organization_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'organizations', key: 'id' },
        onDelete: 'CASCADE',
      },
      author_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      rating: { type: Sequelize.INTEGER, allowNull: false },
      title: { type: Sequelize.STRING(255) },
      content: { type: Sequelize.TEXT },
      owner_reply: { type: Sequelize.TEXT },
      owner_replied_at: { type: Sequelize.DATE },
      is_approved: { type: Sequelize.BOOLEAN, defaultValue: false },
      helpful_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.addIndex('organization_news', ['organization_id']);
    await queryInterface.addIndex('organization_events', ['organization_id']);
    await queryInterface.addIndex('organization_reviews', ['organization_id']);
    await queryInterface.addIndex('organization_reviews', ['author_id']);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('organization_reviews', ['author_id']);
    await queryInterface.removeIndex('organization_reviews', ['organization_id']);
    await queryInterface.removeIndex('organization_events', ['organization_id']);
    await queryInterface.removeIndex('organization_news', ['organization_id']);
    await queryInterface.dropTable('organization_reviews');
    await queryInterface.dropTable('organization_events');
    await queryInterface.dropTable('organization_news');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_organization_events_type";');
  },
};

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('organization_contacts', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
      },
      organization_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: { model: 'organizations', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      general_email: { type: Sequelize.STRING(255) },
      general_phone: { type: Sequelize.STRING(50) },
      contact_person_name: { type: Sequelize.STRING(150) },
      contact_person_title: { type: Sequelize.STRING(150) },
      website_url: { type: Sequelize.TEXT },
      opportunities_url: { type: Sequelize.TEXT },
      whatsapp: { type: Sequelize.STRING(50) },
      telegram: { type: Sequelize.STRING(100) },
      facebook_page: { type: Sequelize.STRING(255) },
      instagram: { type: Sequelize.STRING(255) },
      linkedin: { type: Sequelize.STRING(255) },
      office_hours: { type: Sequelize.STRING(255) },
      address: { type: Sequelize.TEXT },
      map_embed_url: { type: Sequelize.TEXT },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('organization_galleries', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
      },
      organization_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'organizations', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      url: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      public_id: { type: Sequelize.STRING(255) },
      caption: { type: Sequelize.STRING(255) },
      category: {
        type: Sequelize.ENUM('office', 'team', 'events', 'programs', 'community', 'other'),
        allowNull: false,
        defaultValue: 'office',
      },
      sort_order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      is_cover: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('organization_faqs', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
      },
      organization_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'organizations', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      question: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      answer: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      category: { type: Sequelize.STRING(100) },
      sort_order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      is_published: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex('organization_galleries', ['organization_id']);
    await queryInterface.addIndex('organization_galleries', ['sort_order']);
    await queryInterface.addIndex('organization_faqs', ['organization_id']);
    await queryInterface.addIndex('organization_faqs', ['sort_order']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('organization_faqs');
    await queryInterface.dropTable('organization_galleries');
    await queryInterface.dropTable('organization_contacts');
  },
};

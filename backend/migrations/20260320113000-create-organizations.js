'use strict';

const { randomUUID } = require('crypto');
const slugify = require('slugify');

const toSlug = (value = '') => slugify(value, { lower: true, strict: true, trim: true });

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('organizations', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
      },
      slug: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      logo_url: {
        type: Sequelize.TEXT,
      },
      cover_url: {
        type: Sequelize.TEXT,
      },
      description: {
        type: Sequelize.TEXT,
      },
      website_url: {
        type: Sequelize.STRING(255),
      },
      email: {
        type: Sequelize.STRING(255),
      },
      contact_phone: {
        type: Sequelize.STRING(50),
      },
      facebook_url: {
        type: Sequelize.STRING(255),
      },
      telegram_url: {
        type: Sequelize.STRING(255),
      },
      instagram_url: {
        type: Sequelize.STRING(255),
      },
      linkedin_url: {
        type: Sequelize.STRING(255),
      },
      owner_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      is_verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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

    await queryInterface.addIndex('organizations', ['owner_id']);
    await queryInterface.addIndex('organizations', ['slug']);

    const [rows] = await queryInterface.sequelize.query(`
      SELECT u.id, u.name, u.email, u.avatar_url, u.bio, u.website_url, u.contact_phone
      FROM users u
      INNER JOIN roles r ON r.id = u.role_id
      WHERE r.name = 'organization'
    `);

    if (rows.length) {
      const now = new Date();
      await queryInterface.bulkInsert(
        'organizations',
        rows.map((user) => ({
          id: randomUUID(),
          slug: `${toSlug(user.name || 'organization') || 'organization'}-${String(user.id).slice(0, 8)}`,
          name: user.name || 'Organization',
          logo_url: user.avatar_url || null,
          cover_url: null,
          description: user.bio || null,
          website_url: user.website_url || null,
          email: user.email || null,
          contact_phone: user.contact_phone || null,
          facebook_url: null,
          telegram_url: null,
          instagram_url: null,
          linkedin_url: null,
          owner_id: user.id,
          is_verified: false,
          is_published: true,
          created_at: now,
          updated_at: now,
        })),
      );
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable('organizations');
  },
};

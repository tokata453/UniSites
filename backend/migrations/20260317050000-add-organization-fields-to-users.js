'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('users');

    if (!table.website_url) {
      await queryInterface.addColumn('users', 'website_url', {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }

    if (!table.contact_phone) {
      await queryInterface.addColumn('users', 'contact_phone', {
        type: Sequelize.STRING(50),
        allowNull: true,
      });
    }

    if (!table.is_approved) {
      await queryInterface.addColumn('users', 'is_approved', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('users');

    if (table.is_approved) {
      await queryInterface.removeColumn('users', 'is_approved');
    }

    if (table.contact_phone) {
      await queryInterface.removeColumn('users', 'contact_phone');
    }

    if (table.website_url) {
      await queryInterface.removeColumn('users', 'website_url');
    }
  },
};

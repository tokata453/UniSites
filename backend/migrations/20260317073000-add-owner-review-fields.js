'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('reviews', 'owner_reply', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn('reviews', 'owner_replied_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('reviews', 'flagged_for_recheck', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn('reviews', 'flag_reason', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn('reviews', 'flagged_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('reviews', 'flagged_at');
    await queryInterface.removeColumn('reviews', 'flag_reason');
    await queryInterface.removeColumn('reviews', 'flagged_for_recheck');
    await queryInterface.removeColumn('reviews', 'owner_replied_at');
    await queryInterface.removeColumn('reviews', 'owner_reply');
  },
};

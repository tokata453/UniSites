'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('universities', 'shortcut_name', {
      type: Sequelize.STRING(50),
      allowNull: true,
    });

    await queryInterface.addColumn('organizations', 'shortcut_name', {
      type: Sequelize.STRING(50),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('organizations', 'shortcut_name');
    await queryInterface.removeColumn('universities', 'shortcut_name');
  },
};

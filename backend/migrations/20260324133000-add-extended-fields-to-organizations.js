'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('organizations');

    const columns = [
      ['tagline', { type: Sequelize.STRING(255), allowNull: true }],
      ['category', { type: Sequelize.STRING(120), allowNull: true }],
      ['industry', { type: Sequelize.STRING(120), allowNull: true }],
      ['location', { type: Sequelize.STRING(255), allowNull: true }],
      ['address', { type: Sequelize.TEXT, allowNull: true }],
      ['founded_year', { type: Sequelize.INTEGER, allowNull: true }],
      ['team_size', { type: Sequelize.STRING(80), allowNull: true }],
      ['mission', { type: Sequelize.TEXT, allowNull: true }],
      ['vision', { type: Sequelize.TEXT, allowNull: true }],
    ];

    for (const [name, definition] of columns) {
      if (!table[name]) {
        await queryInterface.addColumn('organizations', name, definition);
      }
    }
  },

  async down(queryInterface) {
    const columns = [
      'vision',
      'mission',
      'team_size',
      'founded_year',
      'address',
      'location',
      'industry',
      'category',
      'tagline',
    ];

    for (const column of columns) {
      await queryInterface.removeColumn('organizations', column);
    }
  },
};

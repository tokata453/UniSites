'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await Promise.all([
      queryInterface.addColumn('university_news', 'image_urls', {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        allowNull: false,
        defaultValue: [],
      }),
      queryInterface.addColumn('university_events', 'image_urls', {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        allowNull: false,
        defaultValue: [],
      }),
      queryInterface.addColumn('opportunities', 'image_urls', {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        allowNull: false,
        defaultValue: [],
      }),
    ]);
  },

  async down(queryInterface) {
    await Promise.all([
      queryInterface.removeColumn('university_news', 'image_urls'),
      queryInterface.removeColumn('university_events', 'image_urls'),
      queryInterface.removeColumn('opportunities', 'image_urls'),
    ]);
  },
};

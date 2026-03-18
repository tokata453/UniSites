'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('university_contacts');

    if (!table.admissions_url) {
      await queryInterface.addColumn('university_contacts', 'admissions_url', {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }

    if (!table.programs_url) {
      await queryInterface.addColumn('university_contacts', 'programs_url', {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }

    if (!table.about_url) {
      await queryInterface.addColumn('university_contacts', 'about_url', {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('university_contacts');

    if (table.about_url) {
      await queryInterface.removeColumn('university_contacts', 'about_url');
    }
    if (table.programs_url) {
      await queryInterface.removeColumn('university_contacts', 'programs_url');
    }
    if (table.admissions_url) {
      await queryInterface.removeColumn('university_contacts', 'admissions_url');
    }
  },
};

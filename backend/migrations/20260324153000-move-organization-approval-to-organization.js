'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('organizations', 'is_approved', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.sequelize.query(`
      UPDATE organizations AS org
      SET is_approved = COALESCE(u.is_approved, false)
      FROM users AS u
      WHERE org.owner_id = u.id
    `);
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('organizations', 'is_approved');
  },
};

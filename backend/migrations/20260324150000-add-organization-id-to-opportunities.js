'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('opportunities', 'organization_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'organizations',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addIndex('opportunities', ['organization_id']);

    await queryInterface.sequelize.query(`
      UPDATE opportunities AS opp
      SET organization_id = org.id
      FROM organizations AS org
      WHERE opp.organization_id IS NULL
        AND opp.posted_by = org.owner_id
    `);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('opportunities', ['organization_id']);
    await queryInterface.removeColumn('opportunities', 'organization_id');
  },
};

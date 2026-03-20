'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('conversations', 'organization_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'organizations', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addIndex('conversations', ['organization_id']);
    await queryInterface.addIndex('conversations', ['conversation_context', 'organization_id']);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('conversations', ['conversation_context', 'organization_id']);
    await queryInterface.removeIndex('conversations', ['organization_id']);
    await queryInterface.removeColumn('conversations', 'organization_id');
  },
};

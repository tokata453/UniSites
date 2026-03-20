'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('conversations');

    if (!table.conversation_context) {
      await queryInterface.addColumn('conversations', 'conversation_context', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'personal',
      });
    }

    if (!table.university_id) {
      await queryInterface.addColumn('conversations', 'university_id', {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'universities', key: 'id' },
        onDelete: 'SET NULL',
      });
    }

    await queryInterface.sequelize.query(`
      UPDATE conversations
      SET conversation_context = 'personal'
      WHERE conversation_context IS NULL OR conversation_context = ''
    `);

    await queryInterface.addIndex('conversations', ['conversation_context']);
    await queryInterface.addIndex('conversations', ['university_id']);
    await queryInterface.addIndex('conversations', ['conversation_context', 'university_id']);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('conversations', ['conversation_context', 'university_id']);
    await queryInterface.removeIndex('conversations', ['university_id']);
    await queryInterface.removeIndex('conversations', ['conversation_context']);
    await queryInterface.removeColumn('conversations', 'university_id');
    await queryInterface.removeColumn('conversations', 'conversation_context');
  },
};

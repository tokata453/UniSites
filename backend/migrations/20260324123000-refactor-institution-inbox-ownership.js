'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const conversationTable = await queryInterface.describeTable('conversations');

    if (!conversationTable.participant_user_id) {
      await queryInterface.addColumn('conversations', 'participant_user_id', {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      });
    }

    await queryInterface.changeColumn('conversations', 'user_one_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    });

    await queryInterface.changeColumn('conversations', 'user_two_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    });

    await queryInterface.sequelize.query(`
      UPDATE conversations c
      SET participant_user_id = CASE
        WHEN c.user_one_id = u.owner_id THEN c.user_two_id
        WHEN c.user_two_id = u.owner_id THEN c.user_one_id
        ELSE COALESCE(c.participant_user_id, c.user_one_id)
      END
      FROM universities u
      WHERE c.conversation_context = 'university'
        AND c.university_id = u.id
        AND c.participant_user_id IS NULL
    `);

    await queryInterface.sequelize.query(`
      UPDATE conversations c
      SET participant_user_id = CASE
        WHEN c.user_one_id = o.owner_id THEN c.user_two_id
        WHEN c.user_two_id = o.owner_id THEN c.user_one_id
        ELSE COALESCE(c.participant_user_id, c.user_one_id)
      END
      FROM organizations o
      WHERE c.conversation_context = 'organization'
        AND c.organization_id = o.id
        AND c.participant_user_id IS NULL
    `);

    await queryInterface.addIndex('conversations', ['participant_user_id']);
    await queryInterface.addIndex('conversations', ['conversation_context', 'participant_user_id']);
    await queryInterface.addIndex('conversations', ['conversation_context', 'university_id', 'participant_user_id']);
    await queryInterface.addIndex('conversations', ['conversation_context', 'organization_id', 'participant_user_id']);

    await queryInterface.createTable('university_inbox_accesses', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      university_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'universities', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      access_role: {
        type: Sequelize.ENUM('member', 'staff', 'admin'),
        allowNull: false,
        defaultValue: 'staff',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    await queryInterface.addIndex('university_inbox_accesses', ['university_id']);
    await queryInterface.addIndex('university_inbox_accesses', ['user_id']);
    await queryInterface.addIndex('university_inbox_accesses', ['university_id', 'user_id'], { unique: true });

    await queryInterface.createTable('organization_inbox_accesses', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      organization_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'organizations', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      access_role: {
        type: Sequelize.ENUM('member', 'staff', 'admin'),
        allowNull: false,
        defaultValue: 'staff',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    await queryInterface.addIndex('organization_inbox_accesses', ['organization_id']);
    await queryInterface.addIndex('organization_inbox_accesses', ['user_id']);
    await queryInterface.addIndex('organization_inbox_accesses', ['organization_id', 'user_id'], { unique: true });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('organization_inbox_accesses', ['organization_id', 'user_id']);
    await queryInterface.removeIndex('organization_inbox_accesses', ['user_id']);
    await queryInterface.removeIndex('organization_inbox_accesses', ['organization_id']);
    await queryInterface.dropTable('organization_inbox_accesses');

    await queryInterface.removeIndex('university_inbox_accesses', ['university_id', 'user_id']);
    await queryInterface.removeIndex('university_inbox_accesses', ['user_id']);
    await queryInterface.removeIndex('university_inbox_accesses', ['university_id']);
    await queryInterface.dropTable('university_inbox_accesses');

    await queryInterface.removeIndex('conversations', ['conversation_context', 'organization_id', 'participant_user_id']);
    await queryInterface.removeIndex('conversations', ['conversation_context', 'university_id', 'participant_user_id']);
    await queryInterface.removeIndex('conversations', ['conversation_context', 'participant_user_id']);
    await queryInterface.removeIndex('conversations', ['participant_user_id']);
    await queryInterface.removeColumn('conversations', 'participant_user_id');

    await queryInterface.changeColumn('conversations', 'user_two_id', {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    });

    await queryInterface.changeColumn('conversations', 'user_one_id', {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    });

    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_university_inbox_accesses_access_role";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_organization_inbox_accesses_access_role";');
  },
};

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    const tableNames = tables.map((table) => {
      if (typeof table === 'string') return table;
      return table.tableName || table.table_name || '';
    });

    if (tableNames.includes('university_sources')) return;

    await queryInterface.createTable('university_sources', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      university_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'universities', key: 'id' },
        onDelete: 'CASCADE',
      },
      source_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      source_type: {
        type: Sequelize.STRING(100),
        allowNull: false,
        defaultValue: 'official_website',
      },
      source_url: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      external_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      confidence_score: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 100,
      },
      import_status: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'active',
      },
      last_verified_at: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      raw_payload: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {},
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

    await queryInterface.addIndex('university_sources', ['university_id']);
    await queryInterface.addIndex('university_sources', ['source_type']);
  },

  async down(queryInterface) {
    const tables = await queryInterface.showAllTables();
    const tableNames = tables.map((table) => {
      if (typeof table === 'string') return table;
      return table.tableName || table.table_name || '';
    });

    if (tableNames.includes('university_sources')) {
      await queryInterface.dropTable('university_sources');
    }
  },
};

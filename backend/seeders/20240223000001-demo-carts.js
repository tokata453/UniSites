'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get existing users (assuming they exist from previous seeds)
    const users = await queryInterface.sequelize.query(
      'SELECT id FROM users ORDER BY id LIMIT 6;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    await queryInterface.bulkInsert('carts', [
      // ═══════════════════════════════════════════════════════════
      // USER CARTS (Logged-in users)
      // ═══════════════════════════════════════════════════════════
      {
        id: 1,
        userId: users[0]?.id || 1, // Sokha's cart
        sessionId: null,
        expiresAt: thirtyDaysFromNow,
        createdAt: new Date('2024-02-20 10:00:00'),
        updatedAt: new Date('2024-02-23 15:30:00')
      },
      {
        id: 2,
        userId: users[1]?.id || 2, // Chanthy's cart
        sessionId: null,
        expiresAt: thirtyDaysFromNow,
        createdAt: new Date('2024-02-21 09:15:00'),
        updatedAt: new Date('2024-02-23 14:20:00')
      },
      {
        id: 3,
        userId: users[2]?.id || 3, // David's cart
        sessionId: null,
        expiresAt: thirtyDaysFromNow,
        createdAt: new Date('2024-02-22 11:30:00'),
        updatedAt: new Date('2024-02-23 16:45:00')
      },
      {
        id: 4,
        userId: users[3]?.id || 4, // Sreymom's cart (empty - for testing)
        sessionId: null,
        expiresAt: thirtyDaysFromNow,
        createdAt: new Date('2024-02-23 08:00:00'),
        updatedAt: new Date('2024-02-23 08:00:00')
      },

      // ═══════════════════════════════════════════════════════════
      // GUEST CARTS (Before login)
      // ═══════════════════════════════════════════════════════════
      {
        id: 5,
        userId: null,
        sessionId: 'guest_1708675200000_abc123',
        expiresAt: thirtyDaysFromNow,
        createdAt: new Date('2024-02-23 10:00:00'),
        updatedAt: new Date('2024-02-23 12:30:00')
      },
      {
        id: 6,
        userId: null,
        sessionId: 'guest_1708678800000_def456',
        expiresAt: thirtyDaysFromNow,
        createdAt: new Date('2024-02-23 11:00:00'),
        updatedAt: new Date('2024-02-23 13:15:00')
      },
      {
        id: 7,
        userId: null,
        sessionId: 'guest_1708682400000_ghi789',
        expiresAt: thirtyDaysFromNow,
        createdAt: new Date('2024-02-23 12:00:00'),
        updatedAt: new Date('2024-02-23 14:00:00')
      },

      // ═══════════════════════════════════════════════════════════
      // EXPIRED CART (For testing cleanup)
      // ═══════════════════════════════════════════════════════════
      {
        id: 8,
        userId: null,
        sessionId: 'guest_1705555200000_old123',
        expiresAt: new Date('2024-01-20 00:00:00'), // Expired
        createdAt: new Date('2024-01-15 10:00:00'),
        updatedAt: new Date('2024-01-15 10:00:00')
      }
    ], {});

    console.log('✅ Seeded 8 carts (4 user carts, 3 guest carts, 1 expired)');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('carts', null, {});
  }
};

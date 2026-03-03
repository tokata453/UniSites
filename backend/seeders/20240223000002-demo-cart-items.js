'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get existing products (assuming they exist from previous seeds)
    const products = await queryInterface.sequelize.query(
      'SELECT id, name, price, "salePrice" FROM products ORDER BY id;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const getProductPrice = (productId) => {
      const product = products.find(p => p.id === productId);
      return product ? (product.salePrice || product.price) : '0.00';
    };

    const now = new Date();

    await queryInterface.bulkInsert('cart_items', [
      // ═══════════════════════════════════════════════════════════
      // CART 1: Sokha's Cart (Tech enthusiast - 4 items)
      // ═══════════════════════════════════════════════════════════
      {
        id: 1,
        cartId: 1,
        productId: 1, // iPhone 15 Pro Max
        quantity: 1,
        price: getProductPrice(1),
        createdAt: new Date('2024-02-20 10:15:00'),
        updatedAt: new Date('2024-02-20 10:15:00')
      },
      {
        id: 2,
        cartId: 1,
        productId: 11, // AirPods Pro 2nd Gen
        quantity: 1,
        price: getProductPrice(11),
        createdAt: new Date('2024-02-20 10:20:00'),
        updatedAt: new Date('2024-02-20 10:20:00')
      },
      {
        id: 3,
        cartId: 1,
        productId: 15, // Apple Watch Series 9
        quantity: 1,
        price: getProductPrice(15),
        createdAt: new Date('2024-02-23 15:30:00'),
        updatedAt: new Date('2024-02-23 15:30:00')
      },
      {
        id: 4,
        cartId: 1,
        productId: 18, // iPad Pro 12.9" M2
        quantity: 1,
        price: getProductPrice(18),
        createdAt: new Date('2024-02-23 15:35:00'),
        updatedAt: new Date('2024-02-23 15:35:00')
      },

      // ═══════════════════════════════════════════════════════════
      // CART 2: Chanthy's Cart (Budget conscious - 3 items)
      // ═══════════════════════════════════════════════════════════
      {
        id: 5,
        cartId: 2,
        productId: 4, // iPhone 14 (on sale)
        quantity: 1,
        price: getProductPrice(4),
        createdAt: new Date('2024-02-21 09:30:00'),
        updatedAt: new Date('2024-02-21 09:30:00')
      },
      {
        id: 6,
        cartId: 2,
        productId: 14, // Samsung Galaxy Buds2 Pro (on sale)
        quantity: 2, // Buying 2 as gifts
        price: getProductPrice(14),
        createdAt: new Date('2024-02-21 09:35:00'),
        updatedAt: new Date('2024-02-23 14:20:00') // Updated quantity
      },
      {
        id: 7,
        cartId: 2,
        productId: 2, // iPad Air 11" M2 (on sale)
        quantity: 1,
        price: getProductPrice(20),
        createdAt: new Date('2024-02-23 14:15:00'),
        updatedAt: new Date('2024-02-23 14:15:00')
      },

      // ═══════════════════════════════════════════════════════════
      // CART 3: David's Cart (Professional - 2 expensive items)
      // ═══════════════════════════════════════════════════════════
      {
        id: 8,
        cartId: 3,
        productId: 5, // MacBook Pro 16" M3 Max
        quantity: 1,
        price: getProductPrice(5),
        createdAt: new Date('2024-02-22 11:45:00'),
        updatedAt: new Date('2024-02-22 11:45:00')
      },
      {
        id: 9,
        cartId: 3,
        productId: 14, // Sony Alpha A7 IV Camera
        quantity: 1,
        price: getProductPrice(21),
        createdAt: new Date('2024-02-23 16:45:00'),
        updatedAt: new Date('2024-02-23 16:45:00')
      },

      // ═══════════════════════════════════════════════════════════
      // CART 4: Sreymom's Cart (EMPTY - for testing)
      // ═══════════════════════════════════════════════════════════
      // No items

      // ═══════════════════════════════════════════════════════════
      // CART 5: Guest Cart 1 (Active shopper - 5 items)
      // ═══════════════════════════════════════════════════════════
      {
        id: 10,
        cartId: 5,
        productId: 2, // Samsung Galaxy S24 Ultra
        quantity: 1,
        price: getProductPrice(2),
        createdAt: new Date('2024-02-23 10:10:00'),
        updatedAt: new Date('2024-02-23 10:10:00')
      },
      {
        id: 11,
        cartId: 5,
        productId: 12, // Sony WH-1000XM5
        quantity: 1,
        price: getProductPrice(12),
        createdAt: new Date('2024-02-23 10:15:00'),
        updatedAt: new Date('2024-02-23 10:15:00')
      },
      {
        id: 12,
        cartId: 5,
        productId: 16, // Samsung Galaxy Watch 6 Classic
        quantity: 1,
        price: getProductPrice(16),
        createdAt: new Date('2024-02-23 10:20:00'),
        updatedAt: new Date('2024-02-23 10:20:00')
      },
      {
        id: 13,
        cartId: 5,
        productId: 19, // Samsung Galaxy Tab S9 Ultra
        quantity: 1,
        price: getProductPrice(19),
        createdAt: new Date('2024-02-23 12:25:00'),
        updatedAt: new Date('2024-02-23 12:25:00')
      },
      {
        id: 14,
        cartId: 5,
        productId: 13, // Canon EOS R6 Mark II
        quantity: 1,
        price: getProductPrice(22),
        createdAt: new Date('2024-02-23 12:30:00'),
        updatedAt: new Date('2024-02-23 12:30:00')
      },

      // ═══════════════════════════════════════════════════════════
      // CART 6: Guest Cart 2 (Laptop shopper - 2 items)
      // ═══════════════════════════════════════════════════════════
      {
        id: 15,
        cartId: 6,
        productId: 6, // Dell XPS 15
        quantity: 1,
        price: getProductPrice(6),
        createdAt: new Date('2024-02-23 11:10:00'),
        updatedAt: new Date('2024-02-23 11:10:00')
      },
      {
        id: 16,
        cartId: 6,
        productId: 11, // AirPods Pro (to go with laptop)
        quantity: 1,
        price: getProductPrice(11),
        createdAt: new Date('2024-02-23 13:15:00'),
        updatedAt: new Date('2024-02-23 13:15:00')
      },

      // ═══════════════════════════════════════════════════════════
      // CART 7: Guest Cart 3 (Single item - indecisive shopper)
      // ═══════════════════════════════════════════════════════════
      {
        id: 17,
        cartId: 7,
        productId: 3, // Google Pixel 8 Pro
        quantity: 1,
        price: getProductPrice(3),
        createdAt: new Date('2024-02-23 12:05:00'),
        updatedAt: new Date('2024-02-23 14:00:00') // Changed quantity
      },

      // ═══════════════════════════════════════════════════════════
      // CART 8: Expired Cart (for testing cleanup)
      // ═══════════════════════════════════════════════════════════
      {
        id: 18,
        cartId: 8,
        productId: 8, // MacBook Air 15" M3
        quantity: 1,
        price: getProductPrice(8),
        createdAt: new Date('2024-01-15 10:05:00'),
        updatedAt: new Date('2024-01-15 10:05:00')
      }
    ], {});

    console.log('✅ Seeded 18 cart items across 7 carts');
    console.log('   - Cart 1 (Sokha): 4 items - $3,646');
    console.log('   - Cart 2 (Chanthy): 3 items - $1,256');
    console.log('   - Cart 3 (David): 2 items - $5,798');
    console.log('   - Cart 4 (Sreymom): 0 items (empty cart)');
    console.log('   - Cart 5 (Guest): 5 items - $7,095');
    console.log('   - Cart 6 (Guest): 2 items - $1,998');
    console.log('   - Cart 7 (Guest): 1 item - $899');
    console.log('   - Cart 8 (Expired): 1 item - $1,199');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('cart_items', null, {});
  }
};

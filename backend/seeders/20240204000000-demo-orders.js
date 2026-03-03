'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get actual product IDs from database
    const [products] = await queryInterface.sequelize.query(
      `SELECT id, slug FROM products ORDER BY id`
    );

    // Map products by slug for easy reference
    const productMap = {};
    products.forEach(p => {
      productMap[p.slug] = p.id;
    });

    // First, create orders
    await queryInterface.bulkInsert('orders', [
      {
        id: 1,
        userId: 2, // Sokha
        orderNumber: 'ORD-' + Date.now(),
        totalAmount: 899.99,
        subtotal: 899.99,
        tax: 0,
        shippingCost: 0,
        discount: 0,
        status: 'delivered',
        paymentMethod: 'credit_card',
        paymentStatus: 'completed',
        shippingAddress: JSON.stringify({
          name: 'Sokha Chen',
          street: '456 Street 51',
          city: 'Phnom Penh',
          country: 'Cambodia',
          zipCode: '12302',
          phone: '+855987654321'
        }),
        billingAddress: JSON.stringify({
          name: 'Sokha Chen',
          street: '456 Street 51',
          city: 'Phnom Penh',
          country: 'Cambodia',
          zipCode: '12302'
        }),
        trackingNumber: 'KH123456789',
        notes: 'Please call before delivery',
        shippedAt: new Date('2024-02-10'),
        deliveredAt: new Date('2024-02-12'),
        createdAt: new Date('2024-02-08'),
        updatedAt: new Date('2024-02-12')
      },
      {
        id: 2,
        userId: 3, // Dara
        orderNumber: 'ORD-' + (Date.now() + 1),
        totalAmount: 2299.99,
        subtotal: 2299.99,
        tax: 0,
        shippingCost: 0,
        discount: 0,
        status: 'shipped',
        paymentMethod: 'bank_transfer',
        paymentStatus: 'completed',
        shippingAddress: JSON.stringify({
          name: 'Dara Sok',
          street: '789 Monivong Blvd',
          city: 'Phnom Penh',
          country: 'Cambodia',
          zipCode: '12253',
          phone: '+855111222333'
        }),
        trackingNumber: 'KH987654321',
        shippedAt: new Date('2024-02-14'),
        createdAt: new Date('2024-02-13'),
        updatedAt: new Date('2024-02-14')
      },
      {
        id: 3,
        userId: 4, // Vanna
        orderNumber: 'ORD-' + (Date.now() + 2),
        totalAmount: 1699.98,
        subtotal: 1699.98,
        tax: 0,
        shippingCost: 0,
        discount: 0,
        status: 'processing',
        paymentMethod: 'credit_card',
        paymentStatus: 'completed',
        shippingAddress: JSON.stringify({
          name: 'Vanna Kim',
          street: '321 Riverside Road',
          city: 'Siem Reap',
          country: 'Cambodia',
          zipCode: '17000',
          phone: '+855444555666'
        }),
        createdAt: new Date('2024-02-14'),
        updatedAt: new Date('2024-02-14')
      },
      {
        id: 4,
        userId: 2, // Sokha (second order)
        orderNumber: 'ORD-' + (Date.now() + 3),
        totalAmount: 739.97,
        subtotal: 739.97,
        tax: 0,
        shippingCost: 0,
        discount: 0,
        status: 'pending',
        paymentMethod: 'credit_card',
        paymentStatus: 'pending',
        shippingAddress: JSON.stringify({
          name: 'Sokha Chen',
          street: '456 Street 51',
          city: 'Phnom Penh',
          country: 'Cambodia',
          zipCode: '12302',
          phone: '+855987654321'
        }),
        createdAt: new Date('2024-02-15'),
        updatedAt: new Date('2024-02-15')
      },
      {
        id: 5,
        userId: 3, // Dara (second order)
        orderNumber: 'ORD-' + (Date.now() + 4),
        totalAmount: 479.98,
        subtotal: 499.98,
        tax: 0,
        shippingCost: 0,
        discount: 20,
        status: 'cancelled',
        paymentMethod: 'credit_card',
        paymentStatus: 'refunded',
        shippingAddress: JSON.stringify({
          name: 'Dara Sok',
          street: '789 Monivong Blvd',
          city: 'Phnom Penh',
          country: 'Cambodia',
          zipCode: '12253',
          phone: '+855111222333'
        }),
        notes: 'Customer requested cancellation - duplicate order',
        createdAt: new Date('2024-02-11'),
        updatedAt: new Date('2024-02-11')
      }
    ], {});

    // Then, create order items using actual product IDs
    await queryInterface.bulkInsert('order_items', [
      // Order 1 items (Sokha - delivered)
      {
        orderId: 1,
        productId: productMap['iphone-15-pro'],
        productName: 'iPhone 15 Pro',
        productImage: '/images/products/iphone-15-pro-1.jpg',
        quantity: 1,
        price: 899.99,
        totalPrice: 899.99,
        createdAt: new Date('2024-02-08'),
        updatedAt: new Date('2024-02-08')
      },

      // Order 2 items (Dara - shipped)
      {
        orderId: 2,
        productId: productMap['macbook-pro-16-m3-pro'],
        productName: 'MacBook Pro 16" M3 Pro',
        productImage: '/images/products/macbook-pro-16-1.jpg',
        quantity: 1,
        price: 2299.99,
        totalPrice: 2299.99,
        createdAt: new Date('2024-02-13'),
        updatedAt: new Date('2024-02-13')
      },

      // Order 3 items (Vanna - processing)
      {
        orderId: 3,
        productId: productMap['airpods-pro-2nd-gen'],
        productName: 'AirPods Pro (2nd Generation)',
        productImage: '/images/products/airpods-pro-2-1.jpg',
        quantity: 2,
        price: 249.99,
        totalPrice: 499.98,
        createdAt: new Date('2024-02-14'),
        updatedAt: new Date('2024-02-14')
      },
      {
        orderId: 3,
        productId: productMap['microsoft-surface-pro-9'],
        productName: 'Microsoft Surface Pro 9',
        productImage: '/images/products/surface-pro-9-1.jpg',
        quantity: 1,
        price: 1199.99,
        totalPrice: 1199.99,
        createdAt: new Date('2024-02-14'),
        updatedAt: new Date('2024-02-14')
      },

      // Order 4 items (Sokha - pending)
      {
        orderId: 4,
        productId: productMap['apple-watch-series-9'],
        productName: 'Apple Watch Series 9',
        productImage: '/images/products/apple-watch-9-1.jpg',
        quantity: 1,
        price: 349.99,
        totalPrice: 349.99,
        createdAt: new Date('2024-02-15'),
        updatedAt: new Date('2024-02-15')
      },
      {
        orderId: 4,
        productId: productMap['sony-wh-1000xm5'],
        productName: 'Sony WH-1000XM5',
        productImage: '/images/products/sony-wh1000xm5-1.jpg',
        quantity: 1,
        price: 349.99,
        totalPrice: 349.99,
        createdAt: new Date('2024-02-15'),
        updatedAt: new Date('2024-02-15')
      },
      {
        orderId: 4,
        productId: productMap['apple-magsafe-charger'],
        productName: 'Apple MagSafe Charger',
        productImage: '/images/products/magsafe-charger-1.jpg',
        quantity: 1,
        price: 39.99,
        totalPrice: 39.99,
        createdAt: new Date('2024-02-15'),
        updatedAt: new Date('2024-02-15')
      },

      // Order 5 items (Dara - cancelled)
      {
        orderId: 5,
        productId: productMap['sony-wh-1000xm5'],
        productName: 'Sony WH-1000XM5',
        productImage: '/images/products/sony-wh1000xm5-1.jpg',
        quantity: 1,
        price: 349.99,
        totalPrice: 349.99,
        createdAt: new Date('2024-02-11'),
        updatedAt: new Date('2024-02-11')
      },
      {
        orderId: 5,
        productId: productMap['anker-737-power-bank'],
        productName: 'Anker 737 Power Bank',
        productImage: '/images/products/anker-737-1.jpg',
        quantity: 1,
        price: 149.99,
        totalPrice: 149.99,
        createdAt: new Date('2024-02-11'),
        updatedAt: new Date('2024-02-11')
      }
    ], {});

    console.log('✅ 5 sample orders created with different statuses');
    console.log('   - Order 1: Delivered (Sokha - iPhone)');
    console.log('   - Order 2: Shipped (Dara - MacBook)');
    console.log('   - Order 3: Processing (Vanna - AirPods + Surface)');
    console.log('   - Order 4: Pending (Sokha - Watch + Headphones + Charger)');
    console.log('   - Order 5: Cancelled (Dara - Headphones + Power Bank)');
  },

  down: async (queryInterface, Sequelize) => {
    // Delete in reverse order of creation
    await queryInterface.bulkDelete('order_items', null, {});
    await queryInterface.bulkDelete('orders', null, {});
  }
};

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('categories', [
      {
        name: 'Smartphones',
        slug: 'smartphones',
        description: 'Latest smartphones from top brands including iPhone, Samsung, Google Pixel, and more',
        image: 'categories/1771837631825-165674993.png',
        icon: 'Smartphone',
        isActive: true,
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Computers',
        slug: 'computers',
        description: 'High-performance personal computers for work, gaming, and everyday use',
        image: 'categories/1771837687084-569741010.png',
        icon: 'Laptop',
        isActive: true,
        sortOrder: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'iPad & Tablets',
        slug: 'ipad-tablets',
        description: 'Portable tablets and iPads perfect for entertainment and productivity',
        image: 'categories/1771837722151-362242329.png',
        icon: 'TabletSmartphone',
        isActive: true,
        sortOrder: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Headphones',
        slug: 'headphones',
        description: 'Premium wireless and wired headphones with superior sound quality',
        image: 'categories/1771837754282-597774068.png',
        icon: 'Headphones',
        isActive: true,
        sortOrder: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Smartwatches',
        slug: 'smartwatches',
        description: 'Smart watches and fitness trackers to monitor your health and stay connected',
        image: 'categories/1771837779027-228646158.png',
        icon: 'Watch',
        isActive: true,
        sortOrder: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Accessories',
        slug: 'accessories',
        description: 'Essential accessories for your devices - cases, chargers, cables, and more',
        image: "categories/1771837807943-914914165.png",
        icon: 'Backpack',
        isActive: true,
        sortOrder: 6,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});

    console.log('✅ 6 product categories created');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('categories', null, {});
  }
};

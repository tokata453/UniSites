'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Hash password once for all users
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('password123', salt);

    await queryInterface.bulkInsert('users', [
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@iceelectronics.com',
        password: password,
        phone: '+855123456789',
        role: 'admin',
        isActive: true,
        avatar: 'avatars/1771822942467-96568936.jpg',
        address: JSON.stringify({
          street: '123 Tech Plaza',
          city: 'Phnom Penh',
          country: 'Cambodia',
          zipCode: '12000'
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        firstName: 'Sokha',
        lastName: 'Chen',
        email: 'sokha@example.com',
        password: password,
        phone: '+855987654321',
        role: 'customer',
        isActive: true,
        avatar: 'avatars/1771823100435-431396219.jpg',
        address: JSON.stringify({
          street: '456 Street 51',
          city: 'Phnom Penh',
          country: 'Cambodia',
          zipCode: '12302'
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        firstName: 'Dara',
        lastName: 'Sok',
        email: 'dara123@gmail.com',
        password: password,
        phone: '+855111222333',
        role: 'customer',
        isActive: true,
        avatar: 'avatars/1771823197965-391678535.jpg',
        address: JSON.stringify({
          street: '789 Monivong Blvd',
          city: 'Phnom Penh',
          country: 'Cambodia',
          zipCode: '12253'
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        firstName: 'Vanna',
        lastName: 'Kim',
        email: 'vanna123@gmail.com',
        password: password,
        phone: '+855444555666',
        role: 'customer',
        isActive: true,
        avatar: 'avatars/1771823289676-663418362.jpg',
        address: JSON.stringify({
          street: '321 Riverside Road',
          city: 'Siem Reap',
          country: 'Cambodia',
          zipCode: '17000'
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});

    console.log('✅ 4 demo users created (1 admin, 3 customers)');
    console.log('');
    console.log('📧 Login Credentials:');
    console.log('   Admin:    admin@iceelectronics.com / password123');
    console.log('   Customer: sokha@example.com / password123');
    console.log('   Customer: dara123@gmail.com / password123');
    console.log('   Customer: vanna123@gmail.com / password123');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', null, {});
  }
};

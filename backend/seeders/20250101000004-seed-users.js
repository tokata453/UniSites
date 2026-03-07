'use strict';

const { randomUUID } = require('crypto');
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface) {
    const roles = await queryInterface.sequelize.query(
      `SELECT id, name FROM roles`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const roleMap = {};
    roles.forEach(r => { roleMap[r.name] = r.id; });

    // bulkInsert bypasses Sequelize hooks so we hash manually here
    const password = await bcrypt.hash('unisites@2026', 10);
    const now = new Date();

    const users = [
      // ── Admin ────────────────────────────────────────────────────
      {
        id:          randomUUID(),
        name:        'Admin',
        email:       'admin@gmail.com',
        password,
        avatar_url:  'https://res.cloudinary.com/dih9mkkxo/image/upload/v1772825006/unisites/avatars/uhsey24lsn32h2on8qzb.jpg',
        provider:    'local',
        provider_id: null,
        role_id:     roleMap['admin'],
        bio:         'Platform administrator',
        is_active:   true,
        created_at:  now,
        updated_at:  now,
      },

      // ── Owners ───────────────────────────────────────────────────
      {
        id:          randomUUID(),
        name:        'Dara Sok',
        email:       'darasok@gmail.com',
        password,
        avatar_url:  'https://res.cloudinary.com/dih9mkkxo/image/upload/v1772825006/unisites/avatars/uhsey24lsn32h2on8qzb.jpg',
        provider:    'local',
        provider_id: null,
        role_id:     roleMap['owner'],
        bio:         'University representative at AUPP',
        is_active:   true,
        created_at:  now,
        updated_at:  now,
      },
      {
        id:          randomUUID(),
        name:        'Sreymom Chan',
        email:       'sreymomchan@gmail.com',
        password,
        avatar_url:  'https://res.cloudinary.com/dih9mkkxo/image/upload/v1772825006/unisites/avatars/uhsey24lsn32h2on8qzb.jpg',
        provider:    'local',
        provider_id: null,
        role_id:     roleMap['owner'],
        bio:         'University representative at RUPP',
        is_active:   true,
        created_at:  now,
        updated_at:  now,
      },

      // ── Students ─────────────────────────────────────────────────
      {
        id:          randomUUID(),
        name:        'Bopha Lim',
        email:       'bophalim@gmail.com',
        password,
        avatar_url:  'https://res.cloudinary.com/dih9mkkxo/image/upload/v1772825006/unisites/avatars/uhsey24lsn32h2on8qzb.jpg',
        provider:    'local',
        provider_id: null,
        role_id:     roleMap['student'],
        bio:         'Computer Science student, love building apps',
        is_active:   true,
        created_at:  now,
        updated_at:  now,
      },
      {
        id:          randomUUID(),
        name:        'Piseth Kem',
        email:       'pisethkem@gmail.com',
        password,
        avatar_url:  'https://res.cloudinary.com/dih9mkkxo/image/upload/v1772825006/unisites/avatars/uhsey24lsn32h2on8qzb.jpg',
        provider:    'local',
        provider_id: null,
        role_id:     roleMap['student'],
        bio:         'Business student interested in entrepreneurship',
        is_active:   true,
        created_at:  now,
        updated_at:  now,
      },
      {
        id:          randomUUID(),
        name:        'Channary Ros',
        email:       'channaryros@gmail.com',
        password,
        avatar_url:  'https://res.cloudinary.com/dih9mkkxo/image/upload/v1772825006/unisites/avatars/uhsey24lsn32h2on8qzb.jpg',
        provider:    'local',
        provider_id: null,
        role_id:     roleMap['student'],
        bio:         'Medicine student aspiring to be a doctor',
        is_active:   true,
        created_at:  now,
        updated_at:  now,
      },
    ];

    await queryInterface.bulkInsert('users', users, { ignoreDuplicates: true });
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', {
      email: [
        'superadmin@gmail.com',
        'darasok@gmail.com',
        'sreymomchan@gmail.com',
        'bophalim@gmail.com',
        'pisethkem@gmail.com',
        'channaryros@gmail.com',
      ],
    });
  },
};

'use strict';

const { randomUUID } = require('crypto');

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const orgUsers = await queryInterface.sequelize.query(
      `SELECT id, email FROM users WHERE email IN ('careers@cambodiacareercenter.org', 'mobility@aseancambodia.org', 'programs@younginnovatorscambodia.org')`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const orgUserMap = Object.fromEntries(orgUsers.map((user) => [user.email, user.id]));

    const organizations = [
      {
        id: randomUUID(),
        slug: 'cambodia-career-center',
        name: 'Cambodia Career Center',
        shortcut_name: 'CCC',
        tagline: 'Career and employability support for Cambodian students and graduates.',
        category: 'Career Services',
        industry: 'Education and Employability',
        description: 'Cambodia Career Center connects students and graduates with internships, employability training, career coaching, and entry-level opportunities through local and regional partners.',
        mission: 'Help Cambodian students transition confidently from education to employment.',
        vision: 'A stronger talent pipeline where every student can access practical career support and early professional experience.',
        location: 'Phnom Penh',
        address: 'Phnom Penh, Cambodia',
        founded_year: 2018,
        team_size: '11-50',
        website_url: 'https://cambodiacareercenter.org',
        email: 'careers@cambodiacareercenter.org',
        contact_phone: '+855 23 998 221',
        owner_id: orgUserMap['careers@cambodiacareercenter.org'],
        is_verified: true,
        is_approved: true,
        is_published: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: randomUUID(),
        slug: 'asean-mobility-cambodia',
        name: 'ASEAN Mobility Cambodia',
        shortcut_name: 'AMC',
        tagline: 'Student exchange and regional mobility support across Southeast Asia.',
        category: 'Education Mobility',
        industry: 'International Education',
        description: 'ASEAN Mobility Cambodia supports exchange preparation, international student mobility, and cross-border education opportunities for Cambodian university students.',
        mission: 'Expand student access to regional learning, exchange, and mobility pathways.',
        vision: 'A more connected ASEAN where Cambodian students can move, learn, and collaborate across borders.',
        location: 'Phnom Penh',
        address: 'Phnom Penh, Cambodia',
        founded_year: 2020,
        team_size: '11-50',
        website_url: 'https://aseancambodia.org',
        email: 'mobility@aseancambodia.org',
        contact_phone: '+855 23 998 222',
        owner_id: orgUserMap['mobility@aseancambodia.org'],
        is_verified: true,
        is_approved: true,
        is_published: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: randomUUID(),
        slug: 'young-innovators-cambodia',
        name: 'Young Innovators Cambodia',
        shortcut_name: 'YIC',
        tagline: 'Innovation labs, bootcamps, and youth technology programs.',
        category: 'Youth Development',
        industry: 'Innovation and Technology',
        description: 'Young Innovators Cambodia runs practical bootcamps, labs, and innovation programs that help students build digital, entrepreneurial, and project-based skills.',
        mission: 'Equip young Cambodians with innovation skills, confidence, and real project experience.',
        vision: 'A generation of youth leaders building solutions for Cambodia through technology and innovation.',
        location: 'Phnom Penh',
        address: 'Phnom Penh, Cambodia',
        founded_year: 2019,
        team_size: '11-50',
        website_url: 'https://younginnovatorscambodia.org',
        email: 'programs@younginnovatorscambodia.org',
        contact_phone: '+855 23 998 223',
        owner_id: orgUserMap['programs@younginnovatorscambodia.org'],
        is_verified: true,
        is_approved: true,
        is_published: true,
        created_at: now,
        updated_at: now,
      },
    ].filter((organization) => organization.owner_id);

    await queryInterface.bulkInsert('organizations', organizations, { ignoreDuplicates: true });
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('organizations', {
      slug: [
        'cambodia-career-center',
        'asean-mobility-cambodia',
        'young-innovators-cambodia',
      ],
    });
  },
};

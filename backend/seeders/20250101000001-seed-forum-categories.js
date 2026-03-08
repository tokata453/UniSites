'use strict';
const { randomUUID } = require('crypto');

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('forum_categories', [
      { id: randomUUID(), name: 'General Discussion',        slug: 'general',       description: 'Chat about anything university-related',         icon: 'MessageCircle', color: '#3B82F6', sort_order: 1, thread_count: 0, is_active: true, created_at: now, updated_at: now },
      { id: randomUUID(), name: 'Opportunities & Aid',       slug: 'opportunities', description: 'Scholarships, grants, and financial aid',         icon: 'Award',         color: '#10B981', sort_order: 2, thread_count: 0, is_active: true, created_at: now, updated_at: now },
      { id: randomUUID(), name: 'Career & Internships',      slug: 'careers',       description: 'Jobs, internships, and career advice',             icon: 'Briefcase',     color: '#F59E0B', sort_order: 3, thread_count: 0, is_active: true, created_at: now, updated_at: now },
      { id: randomUUID(), name: 'Events & Activities',       slug: 'events',        description: 'Campus events and extracurricular activities',     icon: 'Calendar',      color: '#8B5CF6', sort_order: 4, thread_count: 0, is_active: true, created_at: now, updated_at: now },
      { id: randomUUID(), name: 'Admissions Help',           slug: 'admissions',    description: 'Tips and questions about university admissions',   icon: 'GraduationCap', color: '#EC4899', sort_order: 5, thread_count: 0, is_active: true, created_at: now, updated_at: now },
      { id: randomUUID(), name: 'Student Life',              slug: 'student-life',  description: 'Dorms, clubs, sports, and campus lifestyle',       icon: 'Users',         color: '#06B6D4', sort_order: 6, thread_count: 0, is_active: true, created_at: now, updated_at: now },
    ], { ignoreDuplicates: true });
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('forum_categories', null, {});
  },
};

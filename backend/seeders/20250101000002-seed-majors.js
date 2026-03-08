'use strict';
const { randomUUID } = require('crypto');

const majors = [
  { name: 'Computer Science',        slug: 'computer-science',        field: 'IT & Computer Science', icon: '💻', stem: true,  demand: 'very_high', salary: 18000 },
  { name: 'Business Administration', slug: 'business-administration', field: 'Business',               icon: '💼', stem: false, demand: 'high',      salary: 12000 },
  { name: 'Civil Engineering',       slug: 'civil-engineering',       field: 'Engineering',            icon: '🏗️', stem: true,  demand: 'high',      salary: 15000 },
  { name: 'Medicine',                slug: 'medicine',                field: 'Medicine & Health',      icon: '🩺', stem: true,  demand: 'very_high', salary: 25000 },
  { name: 'Law',                     slug: 'law',                     field: 'Law',                    icon: '⚖️', stem: false, demand: 'medium',    salary: 14000 },
  { name: 'Education',               slug: 'education',               field: 'Education',              icon: '📚', stem: false, demand: 'high',      salary: 8000  },
  { name: 'Architecture',            slug: 'architecture',            field: 'Architecture',           icon: '🏛️', stem: true,  demand: 'medium',    salary: 13000 },
  { name: 'Tourism & Hospitality',   slug: 'tourism-hospitality',     field: 'Tourism',                icon: '✈️', stem: false, demand: 'high',      salary: 10000 },
  { name: 'Electrical Engineering',  slug: 'electrical-engineering',  field: 'Engineering',            icon: '⚡', stem: true,  demand: 'very_high', salary: 16000 },
  { name: 'Finance & Accounting',    slug: 'finance-accounting',      field: 'Business',               icon: '📊', stem: false, demand: 'high',      salary: 13000 },
  { name: 'International Relations', slug: 'international-relations', field: 'Social Science',         icon: '🌐', stem: false, demand: 'medium',    salary: 11000 },
  { name: 'Agricultural Science',    slug: 'agricultural-science',    field: 'Agriculture',            icon: '🌾', stem: true,  demand: 'medium',    salary: 9000  },
];

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('majors', majors.map(m => ({
      id:             randomUUID(),
      slug:           m.slug,
      name:           m.name,
      field_of_study: m.field,
      icon:           m.icon,
      is_stem:        m.stem,
      job_demand:     m.demand,
      average_salary: m.salary,
      is_featured:    true,
      career_paths:   '{}',
      skills_gained:  '{}',
      related_majors: '{}',
      created_at:     now,
      updated_at:     now,
    })), { ignoreDuplicates: true });
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('majors', null, {});
  },
};

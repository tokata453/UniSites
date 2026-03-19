'use strict';
const { randomUUID } = require('crypto');
const { createMajorCover } = require('../utils/mediaPlaceholders');

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
    const rows = majors.map(m => ({
      id:             randomUUID(),
      slug:           m.slug,
      name:           m.name,
      field_of_study: m.field,
      icon:           m.icon,
      cover_url:      createMajorCover(m.name, m.field, m.icon),
      is_stem:        m.stem,
      job_demand:     m.demand,
      average_salary: m.salary,
      is_featured:    true,
      career_paths:   '{}',
      skills_gained:  '{}',
      related_majors: '{}',
      created_at:     now,
      updated_at:     now,
    }));

    const existing = await queryInterface.sequelize.query(
      `SELECT slug FROM majors WHERE slug = ANY(ARRAY[:slugs])`,
      {
        replacements: { slugs: rows.map((row) => row.slug) },
        type: queryInterface.sequelize.QueryTypes.SELECT,
      }
    );

    const existingSlugs = new Set(existing.map((row) => row.slug));

    for (const row of rows.filter((item) => existingSlugs.has(item.slug))) {
      await queryInterface.bulkUpdate(
        'majors',
        {
          name:           row.name,
          field_of_study: row.field_of_study,
          icon:           row.icon,
          cover_url:      row.cover_url,
          is_stem:        row.is_stem,
          job_demand:     row.job_demand,
          average_salary: row.average_salary,
          is_featured:    row.is_featured,
          updated_at:     now,
        },
        { slug: row.slug }
      );
    }

    const newRows = rows.filter((item) => !existingSlugs.has(item.slug));

    if (newRows.length > 0) {
      await queryInterface.bulkInsert(
        'majors',
        newRows,
        { ignoreDuplicates: true }
      );
    }
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('majors', null, {});
  },
};

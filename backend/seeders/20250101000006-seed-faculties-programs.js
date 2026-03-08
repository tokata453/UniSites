'use strict';
const { randomUUID } = require('crypto');

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const unis = await queryInterface.sequelize.query(
      `SELECT id, slug FROM universities`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    const majors = await queryInterface.sequelize.query(
      `SELECT id, slug FROM majors`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const uniMap  = Object.fromEntries(unis.map(u => [u.slug, u.id]));
    const majorMap = Object.fromEntries(majors.map(m => [m.slug, m.id]));

    const rupp  = uniMap['royal-university-of-phnom-penh'];
    const itc   = uniMap['institute-of-technology-of-cambodia'];
    const norton = uniMap['norton-university'];
    const puc   = uniMap['paññasastra-university-of-cambodia'];
    const aupp  = uniMap['american-university-of-phnom-penh'];

    // ── Faculties ─────────────────────────────────────────────────────────────
    const faculties = [
      // RUPP
      { id: randomUUID(), university_id: rupp,   name: 'Faculty of Science',                    name_km: 'មហាវិទ្យាល័យវិទ្យាសាស្ត្រ',          description: 'Offers programs in mathematics, physics, chemistry, and biology.', dean_name: 'Dr. Heng Chantha',     established_year: 1960, sort_order: 1, created_at: now, updated_at: now },
      { id: randomUUID(), university_id: rupp,   name: 'Faculty of Social Sciences',            name_km: 'មហាវិទ្យាល័យសង្គមវិទ្យា',             description: 'Programs in sociology, psychology, international relations.',        dean_name: 'Dr. Phon Sophea',     established_year: 1962, sort_order: 2, created_at: now, updated_at: now },
      { id: randomUUID(), university_id: rupp,   name: 'Faculty of Business',                   name_km: 'មហាវិទ្យាល័យពាណិជ្ជកម្ម',              description: 'Business administration, accounting, and economics programs.',        dean_name: 'Dr. Sok Kimsan',      established_year: 1965, sort_order: 3, created_at: now, updated_at: now },
      { id: randomUUID(), university_id: rupp,   name: 'Faculty of Law',                        name_km: 'មហាវិទ្យាល័យច្បាប់',                   description: 'Legal studies including civil, criminal, and international law.',    dean_name: 'Dr. Chan Sothy',      established_year: 1966, sort_order: 4, created_at: now, updated_at: now },
      { id: randomUUID(), university_id: rupp,   name: 'Faculty of Engineering',                name_km: 'មហាវិទ្យាល័យវិស្វកម្ម',                description: 'Civil, mechanical, and electrical engineering programs.',            dean_name: 'Dr. Lim Sopheap',     established_year: 1970, sort_order: 5, created_at: now, updated_at: now },
      // ITC
      { id: randomUUID(), university_id: itc,    name: 'Department of Civil Engineering',        name_km: 'នាយកដ្ឋានវិស្វកម្មសំណង់',            description: 'Civil and structural engineering with focus on infrastructure.',    dean_name: 'Dr. Prak Virak',      established_year: 1964, sort_order: 1, created_at: now, updated_at: now },
      { id: randomUUID(), university_id: itc,    name: 'Department of Computer Science',         name_km: 'នាយកដ្ឋានវិទ្យាសាស្ត្រកុំព្យូទ័រ',   description: 'Software engineering, AI, and data science programs.',             dean_name: 'Dr. Nhem Seavmey',    established_year: 1995, sort_order: 2, created_at: now, updated_at: now },
      { id: randomUUID(), university_id: itc,    name: 'Department of Electrical Engineering',   name_km: 'នាយកដ្ឋានវិស្វកម្មអគ្គិសនី',          description: 'Electrical, electronics, and telecommunications engineering.',      dean_name: 'Dr. Touch Bunthoeun', established_year: 1975, sort_order: 3, created_at: now, updated_at: now },
      // Norton
      { id: randomUUID(), university_id: norton, name: 'Faculty of Computer Science',            name_km: 'មហាវិទ្យាល័យវិទ្យាសាស្ត្រកុំព្យូទ័រ', description: 'IT, software engineering, and networking programs.',               dean_name: 'Mr. Keo Bunna',       established_year: 2002, sort_order: 1, created_at: now, updated_at: now },
      { id: randomUUID(), university_id: norton, name: 'Faculty of Business Administration',     name_km: 'មហាវិទ្យាល័យគ្រប់គ្រងពាណិជ្ជកម្ម',   description: 'MBA, accounting, finance, and marketing.',                         dean_name: 'Mr. Hy Sopheaktra',   established_year: 2002, sort_order: 2, created_at: now, updated_at: now },
      // PUC
      { id: randomUUID(), university_id: puc,    name: 'Faculty of Management',                  name_km: 'មហាវិទ្យាល័យគ្រប់គ្រង',                description: 'Business, tourism, and hospitality management.',                   dean_name: 'Dr. Oum Samnang',     established_year: 1997, sort_order: 1, created_at: now, updated_at: now },
      { id: randomUUID(), university_id: puc,    name: 'Faculty of Arts and Humanities',         name_km: 'មហាវិទ្យាល័យសិល្បៈ និង មនុស្សសាស្ត្រ', description: 'Languages, communication, and cultural studies.',                 dean_name: 'Dr. Ly Sreymom',      established_year: 1997, sort_order: 2, created_at: now, updated_at: now },
      // AUPP
      { id: randomUUID(), university_id: aupp,   name: 'School of Business',                     name_km: null,                                     description: 'Business administration with American curriculum.',                 dean_name: 'Dr. Michael Grant',   established_year: 2013, sort_order: 1, created_at: now, updated_at: now },
      { id: randomUUID(), university_id: aupp,   name: 'School of Technology',                   name_km: null,                                     description: 'Computer science and information systems.',                        dean_name: 'Dr. Sarah Chen',      established_year: 2013, sort_order: 2, created_at: now, updated_at: now },
    ];

    await queryInterface.bulkInsert('faculties', faculties);

    // Reload faculties to get IDs
    const insertedFaculties = await queryInterface.sequelize.query(
      `SELECT id, name, university_id FROM faculties`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    const fMap = {};
    insertedFaculties.forEach(f => { fMap[`${f.university_id}_${f.name}`] = f.id; });

    // ── Programs ──────────────────────────────────────────────────────────────
    const programs = [
      // RUPP — Science
      { id: randomUUID(), university_id: rupp, faculty_id: fMap[`${rupp}_Faculty of Science`],          major_id: majorMap['mathematics'],          name: 'Bachelor of Mathematics',              degree_level: 'bachelor', duration_years: 4, language: 'Khmer', tuition_fee: 600,  tuition_currency: 'USD', credits_required: 120, is_available: true, created_at: now, updated_at: now },
      { id: randomUUID(), university_id: rupp, faculty_id: fMap[`${rupp}_Faculty of Science`],          major_id: majorMap['computer-science'],      name: 'Bachelor of Computer Science',         degree_level: 'bachelor', duration_years: 4, language: 'English', tuition_fee: 800, tuition_currency: 'USD', credits_required: 120, is_available: true, created_at: now, updated_at: now },
      { id: randomUUID(), university_id: rupp, faculty_id: fMap[`${rupp}_Faculty of Business`],         major_id: majorMap['business-administration'],name: 'Bachelor of Business Administration',  degree_level: 'bachelor', duration_years: 4, language: 'English', tuition_fee: 700, tuition_currency: 'USD', credits_required: 120, is_available: true, created_at: now, updated_at: now },
      { id: randomUUID(), university_id: rupp, faculty_id: fMap[`${rupp}_Faculty of Law`],              major_id: majorMap['law'],                   name: 'Bachelor of Laws',                     degree_level: 'bachelor', duration_years: 4, language: 'Khmer', tuition_fee: 650,  tuition_currency: 'USD', credits_required: 120, is_available: true, created_at: now, updated_at: now },
      { id: randomUUID(), university_id: rupp, faculty_id: fMap[`${rupp}_Faculty of Engineering`],      major_id: majorMap['civil-engineering'],     name: 'Bachelor of Civil Engineering',        degree_level: 'bachelor', duration_years: 5, language: 'Khmer', tuition_fee: 750,  tuition_currency: 'USD', credits_required: 150, is_available: true, created_at: now, updated_at: now },
      { id: randomUUID(), university_id: rupp, faculty_id: fMap[`${rupp}_Faculty of Business`],         major_id: majorMap['accounting'],            name: 'Master of Accounting',                 degree_level: 'master',   duration_years: 2, language: 'English', tuition_fee: 2000, tuition_currency: 'USD', credits_required: 48, is_available: true, created_at: now, updated_at: now },
      // ITC
      { id: randomUUID(), university_id: itc,  faculty_id: fMap[`${itc}_Department of Civil Engineering`], major_id: majorMap['civil-engineering'], name: 'Bachelor of Civil Engineering',        degree_level: 'bachelor', duration_years: 5, language: 'Khmer',   tuition_fee: 900, tuition_currency: 'USD', credits_required: 150, is_available: true, created_at: now, updated_at: now },
      { id: randomUUID(), university_id: itc,  faculty_id: fMap[`${itc}_Department of Computer Science`],  major_id: majorMap['computer-science'], name: 'Bachelor of Computer Science',         degree_level: 'bachelor', duration_years: 4, language: 'English', tuition_fee: 950, tuition_currency: 'USD', credits_required: 120, is_available: true, created_at: now, updated_at: now },
      { id: randomUUID(), university_id: itc,  faculty_id: fMap[`${itc}_Department of Electrical Engineering`], major_id: majorMap['electrical-engineering'], name: 'Bachelor of Electrical Engineering', degree_level: 'bachelor', duration_years: 5, language: 'Khmer', tuition_fee: 900, tuition_currency: 'USD', credits_required: 150, is_available: true, created_at: now, updated_at: now },
      { id: randomUUID(), university_id: itc,  faculty_id: fMap[`${itc}_Department of Computer Science`],  major_id: majorMap['data-science'],     name: 'Master of Data Science',               degree_level: 'master',   duration_years: 2, language: 'English', tuition_fee: 3000, tuition_currency: 'USD', credits_required: 48, is_available: true, created_at: now, updated_at: now },
      // Norton
      { id: randomUUID(), university_id: norton, faculty_id: fMap[`${norton}_Faculty of Computer Science`],        major_id: majorMap['computer-science'],       name: 'Bachelor of IT',                   degree_level: 'bachelor', duration_years: 4, language: 'English', tuition_fee: 1200, tuition_currency: 'USD', credits_required: 120, is_available: true, created_at: now, updated_at: now },
      { id: randomUUID(), university_id: norton, faculty_id: fMap[`${norton}_Faculty of Business Administration`],  major_id: majorMap['business-administration'], name: 'Bachelor of Business',             degree_level: 'bachelor', duration_years: 4, language: 'English', tuition_fee: 1100, tuition_currency: 'USD', credits_required: 120, is_available: true, created_at: now, updated_at: now },
      { id: randomUUID(), university_id: norton, faculty_id: fMap[`${norton}_Faculty of Business Administration`],  major_id: majorMap['accounting'],            name: 'Bachelor of Accounting',           degree_level: 'bachelor', duration_years: 4, language: 'English', tuition_fee: 1100, tuition_currency: 'USD', credits_required: 120, is_available: true, created_at: now, updated_at: now },
      // PUC
      { id: randomUUID(), university_id: puc, faculty_id: fMap[`${puc}_Faculty of Management`],          major_id: majorMap['hospitality-tourism'],    name: 'Bachelor of Tourism Management',   degree_level: 'bachelor', duration_years: 4, language: 'English', tuition_fee: 1300, tuition_currency: 'USD', credits_required: 120, is_available: true, created_at: now, updated_at: now },
      { id: randomUUID(), university_id: puc, faculty_id: fMap[`${puc}_Faculty of Arts and Humanities`],  major_id: majorMap['english-literature'],    name: 'Bachelor of English',              degree_level: 'bachelor', duration_years: 4, language: 'English', tuition_fee: 1200, tuition_currency: 'USD', credits_required: 120, is_available: true, created_at: now, updated_at: now },
      // AUPP
      { id: randomUUID(), university_id: aupp, faculty_id: fMap[`${aupp}_School of Business`],            major_id: majorMap['business-administration'], name: 'BS in Business Administration',    degree_level: 'bachelor', duration_years: 4, language: 'English', tuition_fee: 5500, tuition_currency: 'USD', credits_required: 120, is_available: true, created_at: now, updated_at: now },
      { id: randomUUID(), university_id: aupp, faculty_id: fMap[`${aupp}_School of Technology`],          major_id: majorMap['computer-science'],       name: 'BS in Computer Science',           degree_level: 'bachelor', duration_years: 4, language: 'English', tuition_fee: 5500, tuition_currency: 'USD', credits_required: 120, is_available: true, created_at: now, updated_at: now },
    ];

    // Only insert programs whose faculty and major IDs were resolved
    const validPrograms = programs.filter(p => p.faculty_id && (p.major_id !== undefined));
    await queryInterface.bulkInsert('programs', validPrograms);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('programs', null, {});
    await queryInterface.bulkDelete('faculties', null, {});
  },
};

'use strict';
const { randomUUID } = require('crypto');

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const unis = await queryInterface.sequelize.query(
      `SELECT id, slug, name, type, province, founded_year, tuition_min, tuition_max FROM universities`,
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
    const puc   = uniMap['paññāsāstra-university-of-cambodia'] || uniMap['paññasastra-university-of-cambodia'];
    const aupp  = uniMap['american-university-of-phnom-penh'];
    const uc    = uniMap['university-of-cambodia'];
    const num   = uniMap['national-university-of-management'];
    const rule  = uniMap['royal-university-of-law-and-economics'];
    const camtech = uniMap['camtech-university'];
    const allUniIds = unis.map((u) => u.id).filter(Boolean);

    await queryInterface.bulkDelete('programs', {
      university_id: allUniIds,
    });
    await queryInterface.bulkDelete('faculties', {
      university_id: allUniIds,
    });

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
      // UC
      { id: randomUUID(), university_id: uc,     name: 'College of Social Sciences',             name_km: null,                                     description: 'Programs in international relations, policy, and communication.',  dean_name: 'Dr. Chan Dara',       established_year: 2003, sort_order: 1, created_at: now, updated_at: now },
      { id: randomUUID(), university_id: uc,     name: 'College of Science and Technology',      name_km: null,                                     description: 'Technology and computing programs with practical lab exposure.',   dean_name: 'Dr. Sok Davy',        established_year: 2003, sort_order: 2, created_at: now, updated_at: now },
      // NUM
      { id: randomUUID(), university_id: num,    name: 'School of Business',                     name_km: null,                                     description: 'Management, accounting, and finance programs.',                    dean_name: 'Dr. Hor Sreyneang',   established_year: 1983, sort_order: 1, created_at: now, updated_at: now },
      { id: randomUUID(), university_id: num,    name: 'School of Public Policy',                name_km: null,                                     description: 'International relations, public policy, and digital economy.',     dean_name: 'Dr. Chay Sengtha',    established_year: 2022, sort_order: 2, created_at: now, updated_at: now },
      // RULE
      { id: randomUUID(), university_id: rule,   name: 'Faculty of Law',                         name_km: 'មហាវិទ្យាល័យនីតិសាស្ត្រ',              description: 'Core legal studies including public and private law.',             dean_name: 'Dr. Pen Bora',        established_year: 1949, sort_order: 1, created_at: now, updated_at: now },
      { id: randomUUID(), university_id: rule,   name: 'Faculty of Economics and Management',    name_km: 'មហាវិទ្យាល័យសេដ្ឋកិច្ច និង គ្រប់គ្រង', description: 'Economics, management, and policy-oriented programs.',             dean_name: 'Dr. Kim Sothea',      established_year: 1949, sort_order: 2, created_at: now, updated_at: now },
      // CamTech
      { id: randomUUID(), university_id: camtech, name: 'Faculty of Engineering',                name_km: null,                                     description: 'Engineering programs with applied and industry-linked training.',  dean_name: 'Dr. Peng Sophea',     established_year: 2018, sort_order: 1, created_at: now, updated_at: now },
      { id: randomUUID(), university_id: camtech, name: 'Faculty of Applied Science',            name_km: null,                                     description: 'Computer science, AI, and applied STEM programs.',                 dean_name: 'Dr. Ly Dararith',     established_year: 2018, sort_order: 2, created_at: now, updated_at: now },
    ];

    const curatedUniIds = new Set(
      [rupp, itc, norton, puc, aupp, uc, num, rule, camtech].filter(Boolean),
    );

    const selectFacultyBlueprints = (uni) => {
      const name = (uni.name || '').toLowerCase();

      if (name.includes('health') || name.includes('medical') || name.includes('puthisastra')) {
        return [
          {
            name: 'Faculty of Health Sciences',
            description: 'Programs focused on clinical knowledge, health systems, and patient care.',
            dean_name: 'Dr. Sreypich Vann',
          },
          {
            name: 'Faculty of Business and Public Health',
            description: 'Management, public health, and service-oriented programs supporting healthcare and administration.',
            dean_name: 'Dr. Dara Kim',
          },
        ];
      }

      if (name.includes('agriculture')) {
        return [
          {
            name: 'Faculty of Agricultural Science',
            description: 'Programs in crop systems, agricultural development, and practical field-based learning.',
            dean_name: 'Dr. Vicheth Men',
          },
          {
            name: 'Faculty of Agribusiness and Technology',
            description: 'Applied programs combining farm management, sustainability, and technology.',
            dean_name: 'Dr. Chanrith Ouk',
          },
        ];
      }

      if (name.includes('law') || name.includes('economics')) {
        return [
          {
            name: 'Faculty of Law and Governance',
            description: 'Legal studies, public administration, and governance-oriented training.',
            dean_name: 'Dr. Sopheak Mean',
          },
          {
            name: 'Faculty of Economics and Management',
            description: 'Economics, finance, and management programs with policy and business applications.',
            dean_name: 'Dr. Chenda Prak',
          },
        ];
      }

      if (
        name.includes('technology') ||
        name.includes('polytechnic') ||
        name.includes('engineering') ||
        name.includes('science') ||
        name.includes('institute of business')
      ) {
        return [
          {
            name: 'Faculty of Engineering and Technology',
            description: 'Hands-on programs in engineering, computing, and applied technical skills.',
            dean_name: 'Dr. Borey Sok',
          },
          {
            name: 'Faculty of Business and Innovation',
            description: 'Business, entrepreneurship, and innovation-focused programs linked to industry practice.',
            dean_name: 'Dr. Maly Chhay',
          },
        ];
      }

      if (uni.type === 'international') {
        return [
          {
            name: 'School of Business and Leadership',
            description: 'English-medium business programs with leadership, communication, and project-based learning.',
            dean_name: 'Dr. Sophia Lim',
          },
          {
            name: 'School of Science and Digital Studies',
            description: 'Technology and science programs designed around practical and international-facing skills.',
            dean_name: 'Dr. Daniel Phan',
          },
        ];
      }

      return [
        {
          name: 'Faculty of Business and Social Sciences',
          description: 'Programs in management, communication, social science, and public-facing professions.',
          dean_name: 'Dr. Sophal Dy',
        },
        {
          name: 'Faculty of Science and Technology',
          description: 'Academic and applied programs in computing, engineering foundations, and STEM learning.',
          dean_name: 'Dr. Pich Seyha',
        },
      ];
    };

    const genericFaculties = unis
      .filter((uni) => !curatedUniIds.has(uni.id))
      .flatMap((uni) =>
        selectFacultyBlueprints(uni).map((faculty, index) => ({
          id: randomUUID(),
          university_id: uni.id,
          name: faculty.name,
          name_km: null,
          description: faculty.description,
          dean_name: faculty.dean_name,
          established_year: uni.founded_year || 2005,
          sort_order: index + 1,
          created_at: now,
          updated_at: now,
        })),
      );

    const sharedExtensionFaculties = unis.flatMap((uni) => ([
      {
        id: randomUUID(),
        university_id: uni.id,
        name: 'Faculty of Education and Languages',
        name_km: null,
        description: 'Programs supporting language proficiency, communication, and teacher development for local and international learning pathways.',
        dean_name: 'Dr. Sreynich Kao',
        established_year: uni.founded_year || 2005,
        sort_order: 90,
        created_at: now,
        updated_at: now,
      },
      {
        id: randomUUID(),
        university_id: uni.id,
        name: 'Center for Professional Studies',
        name_km: null,
        description: 'Career-oriented programs and short-form professional pathways designed for employability and continuing education.',
        dean_name: 'Dr. Vannak Meas',
        established_year: uni.founded_year || 2005,
        sort_order: 91,
        created_at: now,
        updated_at: now,
      },
    ]));

    faculties.push(...genericFaculties, ...sharedExtensionFaculties);

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
      // UC
      { id: randomUUID(), university_id: uc, faculty_id: fMap[`${uc}_College of Social Sciences`],        major_id: majorMap['international-relations'], name: 'Bachelor of International Relations', degree_level: 'bachelor', duration_years: 4, language: 'English', tuition_fee: 1800, tuition_currency: 'USD', credits_required: 120, is_available: true, created_at: now, updated_at: now },
      { id: randomUUID(), university_id: uc, faculty_id: fMap[`${uc}_College of Science and Technology`], major_id: majorMap['computer-science'],       name: 'Bachelor of Computer Science',       degree_level: 'bachelor', duration_years: 4, language: 'English', tuition_fee: 2200, tuition_currency: 'USD', credits_required: 120, is_available: true, created_at: now, updated_at: now },
      // NUM
      { id: randomUUID(), university_id: num, faculty_id: fMap[`${num}_School of Business`],              major_id: majorMap['business-administration'], name: 'Bachelor of Business Administration', degree_level: 'bachelor', duration_years: 4, language: 'Khmer', tuition_fee: 950, tuition_currency: 'USD', credits_required: 120, is_available: true, created_at: now, updated_at: now },
      { id: randomUUID(), university_id: num, faculty_id: fMap[`${num}_School of Public Policy`],         major_id: majorMap['international-relations'], name: 'Bachelor of International Relations', degree_level: 'bachelor', duration_years: 4, language: 'English', tuition_fee: 1400, tuition_currency: 'USD', credits_required: 120, is_available: true, created_at: now, updated_at: now },
      // RULE
      { id: randomUUID(), university_id: rule, faculty_id: fMap[`${rule}_Faculty of Law`],                major_id: majorMap['law'],                     name: 'Bachelor of Laws',                    degree_level: 'bachelor', duration_years: 4, language: 'Khmer', tuition_fee: 850, tuition_currency: 'USD', credits_required: 120, is_available: true, created_at: now, updated_at: now },
      { id: randomUUID(), university_id: rule, faculty_id: fMap[`${rule}_Faculty of Economics and Management`], major_id: majorMap['business-administration'], name: 'Bachelor of Economics and Management', degree_level: 'bachelor', duration_years: 4, language: 'Khmer', tuition_fee: 900, tuition_currency: 'USD', credits_required: 120, is_available: true, created_at: now, updated_at: now },
      // CamTech
      { id: randomUUID(), university_id: camtech, faculty_id: fMap[`${camtech}_Faculty of Engineering`],  major_id: majorMap['electrical-engineering'],  name: 'Bachelor of Electrical Engineering',   degree_level: 'bachelor', duration_years: 4, language: 'English', tuition_fee: 3200, tuition_currency: 'USD', credits_required: 120, is_available: true, created_at: now, updated_at: now },
      { id: randomUUID(), university_id: camtech, faculty_id: fMap[`${camtech}_Faculty of Applied Science`], major_id: majorMap['computer-science'],      name: 'Bachelor of Computer Science',         degree_level: 'bachelor', duration_years: 4, language: 'English', tuition_fee: 3400, tuition_currency: 'USD', credits_required: 120, is_available: true, created_at: now, updated_at: now },
    ];

    const genericPrograms = [];
    const buildProgram = (uni, facultyName, majorSlug, name, degreeLevel, durationYears, language, tuitionFee, creditsRequired) => {
      const facultyId = fMap[`${uni.id}_${facultyName}`];
      const majorId = majorMap[majorSlug];
      if (!facultyId || !majorId) return null;
      return {
        id: randomUUID(),
        university_id: uni.id,
        faculty_id: facultyId,
        major_id: majorId,
        name,
        degree_level: degreeLevel,
        duration_years: durationYears,
        language,
        tuition_fee: tuitionFee,
        tuition_currency: 'USD',
        credits_required: creditsRequired,
        is_available: true,
        created_at: now,
        updated_at: now,
      };
    };

    const estimateTuition = (uni, fallback) => {
      if (uni.tuition_min && uni.tuition_max) {
        return Math.round((Number(uni.tuition_min) + Number(uni.tuition_max)) / 2);
      }
      if (uni.tuition_max) return Number(uni.tuition_max);
      if (uni.tuition_min) return Number(uni.tuition_min);
      return fallback;
    };

    unis
      .filter((uni) => !curatedUniIds.has(uni.id))
      .forEach((uni) => {
        const name = (uni.name || '').toLowerCase();
        const language = uni.type === 'public' ? 'Khmer' : 'English';
        const standardTuition = estimateTuition(uni, uni.type === 'international' ? 3500 : 1200);

        if (name.includes('health') || name.includes('medical') || name.includes('puthisastra')) {
          genericPrograms.push(
            buildProgram(uni, 'Faculty of Health Sciences', 'medicine', 'Bachelor of Medicine', 'bachelor', 6, language, standardTuition + 1200, 180),
            buildProgram(uni, 'Faculty of Health Sciences', 'education', 'Bachelor of Community Health Education', 'bachelor', 4, language, standardTuition, 120),
            buildProgram(uni, 'Faculty of Business and Public Health', 'business-administration', 'Bachelor of Healthcare Management', 'bachelor', 4, language, standardTuition, 120),
            buildProgram(uni, 'Faculty of Business and Public Health', 'international-relations', 'Bachelor of Public Health Policy', 'bachelor', 4, language, standardTuition, 120),
          );
          return;
        }

        if (name.includes('agriculture')) {
          genericPrograms.push(
            buildProgram(uni, 'Faculty of Agricultural Science', 'agricultural-science', 'Bachelor of Agricultural Science', 'bachelor', 4, language, standardTuition, 120),
            buildProgram(uni, 'Faculty of Agricultural Science', 'civil-engineering', 'Bachelor of Irrigation and Rural Infrastructure', 'bachelor', 4, language, standardTuition + 200, 126),
            buildProgram(uni, 'Faculty of Agribusiness and Technology', 'business-administration', 'Bachelor of Agribusiness Management', 'bachelor', 4, language, standardTuition, 120),
            buildProgram(uni, 'Faculty of Agribusiness and Technology', 'computer-science', 'Bachelor of Agricultural Information Systems', 'bachelor', 4, 'English', standardTuition + 150, 120),
          );
          return;
        }

        if (name.includes('law') || name.includes('economics')) {
          genericPrograms.push(
            buildProgram(uni, 'Faculty of Law and Governance', 'law', 'Bachelor of Laws', 'bachelor', 4, language, standardTuition, 120),
            buildProgram(uni, 'Faculty of Law and Governance', 'international-relations', 'Bachelor of Governance and Public Affairs', 'bachelor', 4, 'English', standardTuition, 120),
            buildProgram(uni, 'Faculty of Economics and Management', 'business-administration', 'Bachelor of Business Administration', 'bachelor', 4, language, standardTuition, 120),
            buildProgram(uni, 'Faculty of Economics and Management', 'finance-accounting', 'Bachelor of Finance and Accounting', 'bachelor', 4, language, standardTuition, 120),
          );
          return;
        }

        if (
          name.includes('technology') ||
          name.includes('polytechnic') ||
          name.includes('engineering') ||
          name.includes('science') ||
          name.includes('institute of business')
        ) {
          genericPrograms.push(
            buildProgram(uni, 'Faculty of Engineering and Technology', 'computer-science', 'Bachelor of Computer Science', 'bachelor', 4, 'English', standardTuition, 120),
            buildProgram(uni, 'Faculty of Engineering and Technology', 'electrical-engineering', 'Bachelor of Electrical Engineering', 'bachelor', 4, language, standardTuition + 200, 126),
            buildProgram(uni, 'Faculty of Engineering and Technology', 'civil-engineering', 'Bachelor of Civil Engineering', 'bachelor', 4, language, standardTuition + 200, 126),
            buildProgram(uni, 'Faculty of Business and Innovation', 'business-administration', 'Bachelor of Innovation Management', 'bachelor', 4, 'English', standardTuition, 120),
          );
          return;
        }

        if (uni.type === 'international') {
          genericPrograms.push(
            buildProgram(uni, 'School of Business and Leadership', 'business-administration', 'Bachelor of Business Administration', 'bachelor', 4, 'English', standardTuition, 120),
            buildProgram(uni, 'School of Business and Leadership', 'international-relations', 'Bachelor of International Relations', 'bachelor', 4, 'English', standardTuition, 120),
            buildProgram(uni, 'School of Science and Digital Studies', 'computer-science', 'Bachelor of Computer Science', 'bachelor', 4, 'English', standardTuition, 120),
            buildProgram(uni, 'School of Science and Digital Studies', 'education', 'Bachelor of Education Leadership', 'bachelor', 4, 'English', standardTuition - 200, 120),
          );
          return;
        }

        genericPrograms.push(
          buildProgram(uni, 'Faculty of Business and Social Sciences', 'business-administration', 'Bachelor of Business Administration', 'bachelor', 4, language, standardTuition, 120),
          buildProgram(uni, 'Faculty of Business and Social Sciences', 'international-relations', 'Bachelor of International Relations', 'bachelor', 4, 'English', standardTuition, 120),
          buildProgram(uni, 'Faculty of Science and Technology', 'computer-science', 'Bachelor of Computer Science', 'bachelor', 4, 'English', standardTuition + 100, 120),
          buildProgram(uni, 'Faculty of Science and Technology', 'education', 'Bachelor of Education', 'bachelor', 4, language, Math.max(600, standardTuition - 100), 120),
        );
      });

    const sharedExtensionPrograms = [];

    unis.forEach((uni) => {
      const language = uni.type === 'public' ? 'Khmer' : 'English';
      const standardTuition = estimateTuition(uni, uni.type === 'international' ? 3500 : 1200);

      sharedExtensionPrograms.push(
        buildProgram(
          uni,
          'Faculty of Education and Languages',
          'education',
          'Bachelor of Education',
          'bachelor',
          4,
          language,
          Math.max(600, standardTuition - 150),
          120,
        ),
        buildProgram(
          uni,
          'Faculty of Education and Languages',
          'international-relations',
          'Bachelor of English for International Communication',
          'bachelor',
          4,
          'English',
          Math.max(650, standardTuition - 50),
          120,
        ),
        buildProgram(
          uni,
          'Center for Professional Studies',
          'business-administration',
          'Diploma in Professional Business Practice',
          'diploma',
          2,
          language,
          Math.max(500, Math.round(standardTuition * 0.6)),
          60,
        ),
        buildProgram(
          uni,
          'Center for Professional Studies',
          'computer-science',
          'Certificate in Digital Skills and Data Tools',
          'certificate',
          1,
          'English',
          Math.max(350, Math.round(standardTuition * 0.35)),
          24,
        ),
      );
    });

    // Only insert programs whose faculty and major IDs were resolved
    const validPrograms = [...programs, ...genericPrograms, ...sharedExtensionPrograms].filter((p) => p?.faculty_id);
    await queryInterface.bulkInsert('programs', validPrograms);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('programs', null, {});
    await queryInterface.bulkDelete('faculties', null, {});
  },
};

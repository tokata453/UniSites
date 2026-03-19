'use strict';
const { randomUUID } = require('crypto');

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const questions = [
      {
        id: randomUUID(),
        question: 'Which of these activities do you enjoy most?',
        options: JSON.stringify({ A: 'Writing code or solving logic puzzles', B: 'Managing projects and leading teams', C: 'Designing and building structures', D: 'Helping and caring for people' }),
        major_weights: JSON.stringify({ A: { 'computer-science': 3, 'electrical-engineering': 2 }, B: { 'business-administration': 3, 'finance-accounting': 2 }, C: { 'civil-engineering': 3, 'architecture': 2 }, D: { 'medicine': 3, 'education': 2 } }),
        sort_order: 1, is_active: true, created_at: now, updated_at: now,
      },
      {
        id: randomUUID(),
        question: 'How do you prefer to spend your free time?',
        options: JSON.stringify({ A: 'Exploring new technologies or building apps', B: 'Traveling or learning about different cultures', C: 'Sketching, designing, or working with your hands', D: 'Reading, researching, or studying nature' }),
        major_weights: JSON.stringify({ A: { 'computer-science': 3, 'electrical-engineering': 1 }, B: { 'tourism-hospitality': 3, 'international-relations': 2 }, C: { 'architecture': 3, 'civil-engineering': 1 }, D: { 'agricultural-science': 2, 'medicine': 2 } }),
        sort_order: 2, is_active: true, created_at: now, updated_at: now,
      },
      {
        id: randomUUID(),
        question: 'Which subject did you enjoy most in school?',
        options: JSON.stringify({ A: 'Mathematics and Physics', B: 'Economics and Business Studies', C: 'Biology and Chemistry', D: 'History, Literature, or Languages' }),
        major_weights: JSON.stringify({ A: { 'computer-science': 2, 'civil-engineering': 2, 'electrical-engineering': 3 }, B: { 'business-administration': 3, 'finance-accounting': 3 }, C: { 'medicine': 3, 'agricultural-science': 2 }, D: { 'law': 2, 'international-relations': 2, 'education': 2 } }),
        sort_order: 3, is_active: true, created_at: now, updated_at: now,
      },
      {
        id: randomUUID(),
        question: 'What kind of career outcome matters most to you?',
        options: JSON.stringify({ A: 'High salary and tech career', B: 'Running my own business', C: 'Making a difference in peoples lives', D: 'Creative expression and design' }),
        major_weights: JSON.stringify({ A: { 'computer-science': 3, 'electrical-engineering': 2 }, B: { 'business-administration': 3, 'finance-accounting': 2 }, C: { 'medicine': 3, 'education': 2, 'law': 1 }, D: { 'architecture': 3, 'tourism-hospitality': 1 } }),
        sort_order: 4, is_active: true, created_at: now, updated_at: now,
      },
      {
        id: randomUUID(),
        question: 'How do you approach solving a difficult problem?',
        options: JSON.stringify({ A: 'I break it into logical steps and write it out', B: 'I talk to others and brainstorm solutions', C: 'I experiment and try different approaches', D: 'I research extensively before acting' }),
        major_weights: JSON.stringify({ A: { 'computer-science': 3, 'finance-accounting': 2 }, B: { 'business-administration': 2, 'international-relations': 2 }, C: { 'civil-engineering': 2, 'electrical-engineering': 2, 'agricultural-science': 1 }, D: { 'law': 3, 'medicine': 2 } }),
        sort_order: 5, is_active: true, created_at: now, updated_at: now,
      },
      {
        id: randomUUID(),
        question: 'Which type of work environment sounds best to you?',
        options: JSON.stringify({ A: 'Office or startup team', B: 'Construction site or design studio', C: 'Hospital, school, or community setting', D: 'Government, NGO, or international office' }),
        major_weights: JSON.stringify({ A: { 'computer-science': 2, 'business-administration': 2, 'finance-accounting': 2 }, B: { 'civil-engineering': 3, 'architecture': 3, 'electrical-engineering': 2 }, C: { 'medicine': 3, 'education': 3, 'agricultural-science': 1 }, D: { 'law': 2, 'international-relations': 3, 'tourism-hospitality': 1 } }),
        sort_order: 6, is_active: true, created_at: now, updated_at: now,
      },
      {
        id: randomUUID(),
        question: 'What are you naturally best at?',
        options: JSON.stringify({ A: 'Analyzing numbers and systems', B: 'Communicating and persuading people', C: 'Drawing, visualizing, or designing', D: 'Understanding science and caring for others' }),
        major_weights: JSON.stringify({ A: { 'computer-science': 3, 'finance-accounting': 3, 'electrical-engineering': 2 }, B: { 'business-administration': 2, 'law': 2, 'international-relations': 2, 'tourism-hospitality': 2 }, C: { 'architecture': 3, 'civil-engineering': 1 }, D: { 'medicine': 3, 'education': 2, 'agricultural-science': 2 } }),
        sort_order: 7, is_active: true, created_at: now, updated_at: now,
      },
      {
        id: randomUUID(),
        question: 'Which kind of impact do you want your work to have?',
        options: JSON.stringify({ A: 'Build useful digital tools and systems', B: 'Grow businesses and create jobs', C: 'Improve infrastructure and cities', D: 'Improve lives through care, policy, or teaching' }),
        major_weights: JSON.stringify({ A: { 'computer-science': 3, 'electrical-engineering': 2 }, B: { 'business-administration': 3, 'finance-accounting': 2, 'tourism-hospitality': 1 }, C: { 'civil-engineering': 3, 'architecture': 2, 'agricultural-science': 1 }, D: { 'medicine': 2, 'education': 3, 'law': 2, 'international-relations': 2 } }),
        sort_order: 8, is_active: true, created_at: now, updated_at: now,
      },
      {
        id: randomUUID(),
        question: 'Which school project would you most enjoy?',
        options: JSON.stringify({ A: 'Building an app or robot prototype', B: 'Creating a business plan or market study', C: 'Designing a building model or structural plan', D: 'Writing a policy paper or leading a community campaign' }),
        major_weights: JSON.stringify({ A: { 'computer-science': 3, 'electrical-engineering': 3 }, B: { 'business-administration': 3, 'finance-accounting': 2, 'tourism-hospitality': 1 }, C: { 'architecture': 3, 'civil-engineering': 3 }, D: { 'law': 2, 'international-relations': 3, 'education': 1, 'medicine': 1 } }),
        sort_order: 9, is_active: true, created_at: now, updated_at: now,
      },
      {
        id: randomUUID(),
        question: 'When learning something new, what motivates you most?',
        options: JSON.stringify({ A: 'Mastering technical skills', B: 'Preparing for leadership or entrepreneurship', C: 'Solving real-world social or health problems', D: 'Exploring cultures, people, and global issues' }),
        major_weights: JSON.stringify({ A: { 'computer-science': 3, 'electrical-engineering': 2, 'civil-engineering': 1 }, B: { 'business-administration': 3, 'finance-accounting': 2 }, C: { 'medicine': 3, 'education': 2, 'agricultural-science': 2, 'law': 1 }, D: { 'international-relations': 3, 'tourism-hospitality': 2, 'law': 1 } }),
        sort_order: 10, is_active: true, created_at: now, updated_at: now,
      },
      {
        id: randomUUID(),
        question: 'Which kind of class activity do you usually enjoy most?',
        options: JSON.stringify({ A: 'Lab work or technical exercises', B: 'Presentations and group discussions', C: 'Drawing, drafting, or making models', D: 'Case studies about people or society' }),
        major_weights: JSON.stringify({ A: { 'computer-science': 2, 'electrical-engineering': 3, 'medicine': 1, 'agricultural-science': 1 }, B: { 'business-administration': 2, 'international-relations': 2, 'education': 2, 'tourism-hospitality': 1 }, C: { 'architecture': 3, 'civil-engineering': 2 }, D: { 'law': 2, 'medicine': 2, 'education': 2 } }),
        sort_order: 11, is_active: true, created_at: now, updated_at: now,
      },
      {
        id: randomUUID(),
        question: 'Which challenge sounds the most exciting to you?',
        options: JSON.stringify({ A: 'Creating smart software solutions', B: 'Growing a company or managing money well', C: 'Designing safer buildings and systems', D: 'Helping communities through service or policy' }),
        major_weights: JSON.stringify({ A: { 'computer-science': 3, 'electrical-engineering': 2 }, B: { 'business-administration': 3, 'finance-accounting': 3 }, C: { 'civil-engineering': 3, 'architecture': 2 }, D: { 'law': 2, 'education': 2, 'international-relations': 2, 'medicine': 1 } }),
        sort_order: 12, is_active: true, created_at: now, updated_at: now,
      },
      {
        id: randomUUID(),
        question: 'Which of these tools would you be happiest using every week?',
        options: JSON.stringify({ A: 'Code editor, data tools, or lab equipment', B: 'Spreadsheets, presentations, and reports', C: 'Design software, blueprints, and models', D: 'Books, research articles, and policy documents' }),
        major_weights: JSON.stringify({ A: { 'computer-science': 3, 'electrical-engineering': 2, 'medicine': 1, 'agricultural-science': 1 }, B: { 'business-administration': 3, 'finance-accounting': 3, 'tourism-hospitality': 1 }, C: { 'architecture': 3, 'civil-engineering': 3 }, D: { 'law': 2, 'international-relations': 2, 'education': 2 } }),
        sort_order: 13, is_active: true, created_at: now, updated_at: now,
      },
      {
        id: randomUUID(),
        question: 'How important is creativity in your future career?',
        options: JSON.stringify({ A: 'Not the main thing, I prefer logic and structure', B: 'Useful, but balanced with practical decisions', C: 'Very important, I want to design and create', D: 'Important for solving human and social problems' }),
        major_weights: JSON.stringify({ A: { 'computer-science': 2, 'finance-accounting': 2, 'electrical-engineering': 2 }, B: { 'business-administration': 2, 'civil-engineering': 2, 'tourism-hospitality': 1 }, C: { 'architecture': 3 }, D: { 'education': 2, 'medicine': 1, 'international-relations': 2, 'law': 1 } }),
        sort_order: 14, is_active: true, created_at: now, updated_at: now,
      },
      {
        id: randomUUID(),
        question: 'Which type of problem do you most enjoy solving?',
        options: JSON.stringify({ A: 'Technical bugs or system issues', B: 'Business, customer, or market problems', C: 'Physical design and infrastructure problems', D: 'Human, legal, or social problems' }),
        major_weights: JSON.stringify({ A: { 'computer-science': 3, 'electrical-engineering': 2 }, B: { 'business-administration': 3, 'finance-accounting': 2, 'tourism-hospitality': 1 }, C: { 'civil-engineering': 3, 'architecture': 2, 'agricultural-science': 1 }, D: { 'law': 3, 'medicine': 2, 'education': 2, 'international-relations': 2 } }),
        sort_order: 15, is_active: true, created_at: now, updated_at: now,
      },
      {
        id: randomUUID(),
        question: 'Which statement sounds most like you?',
        options: JSON.stringify({ A: 'I enjoy precision and technical depth', B: 'I like leading, organizing, and negotiating', C: 'I notice visual details and structure around me', D: 'I care deeply about people and their future' }),
        major_weights: JSON.stringify({ A: { 'computer-science': 2, 'electrical-engineering': 2, 'finance-accounting': 1 }, B: { 'business-administration': 3, 'law': 2, 'international-relations': 2 }, C: { 'architecture': 3, 'civil-engineering': 2 }, D: { 'medicine': 2, 'education': 3, 'tourism-hospitality': 1 } }),
        sort_order: 16, is_active: true, created_at: now, updated_at: now,
      },
      {
        id: randomUUID(),
        question: 'What matters most when choosing a major?',
        options: JSON.stringify({ A: 'Strong job demand and future-proof skills', B: 'Versatility and leadership opportunities', C: 'A clear path to professional practice', D: 'Meaningful contribution to society' }),
        major_weights: JSON.stringify({ A: { 'computer-science': 3, 'electrical-engineering': 3, 'civil-engineering': 2 }, B: { 'business-administration': 3, 'finance-accounting': 2, 'international-relations': 1 }, C: { 'medicine': 2, 'law': 2, 'architecture': 2, 'civil-engineering': 2 }, D: { 'education': 3, 'medicine': 2, 'agricultural-science': 2, 'international-relations': 2 } }),
        sort_order: 17, is_active: true, created_at: now, updated_at: now,
      },
      {
        id: randomUUID(),
        question: 'If you joined a student club, which role would fit you best?',
        options: JSON.stringify({ A: 'Tech builder or problem solver', B: 'Organizer or team leader', C: 'Designer or project planner', D: 'Advocate, mentor, or community volunteer' }),
        major_weights: JSON.stringify({ A: { 'computer-science': 3, 'electrical-engineering': 2 }, B: { 'business-administration': 3, 'finance-accounting': 1, 'tourism-hospitality': 1 }, C: { 'architecture': 3, 'civil-engineering': 2 }, D: { 'education': 2, 'law': 2, 'international-relations': 2, 'medicine': 1 } }),
        sort_order: 18, is_active: true, created_at: now, updated_at: now,
      },
      {
        id: randomUUID(),
        question: 'Which future task sounds most satisfying?',
        options: JSON.stringify({ A: 'Launching a digital product or platform', B: 'Managing a company department or budget', C: 'Seeing a structure you helped design get built', D: 'Helping someone learn, heal, or access justice' }),
        major_weights: JSON.stringify({ A: { 'computer-science': 3, 'electrical-engineering': 1 }, B: { 'business-administration': 3, 'finance-accounting': 3 }, C: { 'civil-engineering': 3, 'architecture': 3 }, D: { 'medicine': 3, 'education': 3, 'law': 2 } }),
        sort_order: 19, is_active: true, created_at: now, updated_at: now,
      },
      {
        id: randomUUID(),
        question: 'Which area would you most like to keep learning about for years?',
        options: JSON.stringify({ A: 'Technology, systems, and innovation', B: 'Business, leadership, and finance', C: 'Design, construction, and the built environment', D: 'Health, society, law, education, or global affairs' }),
        major_weights: JSON.stringify({ A: { 'computer-science': 3, 'electrical-engineering': 3 }, B: { 'business-administration': 3, 'finance-accounting': 3, 'tourism-hospitality': 1 }, C: { 'civil-engineering': 3, 'architecture': 3, 'agricultural-science': 1 }, D: { 'medicine': 2, 'law': 2, 'education': 2, 'international-relations': 2 } }),
        sort_order: 20, is_active: true, created_at: now, updated_at: now,
      },
    ];

    await queryInterface.bulkDelete('major_quiz_questions', null, {});

    await queryInterface.bulkInsert('major_quiz_questions', questions);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('major_quiz_questions', null, {});
  },
};

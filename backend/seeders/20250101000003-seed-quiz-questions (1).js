'use strict';
const { randomUUID } = require('crypto');

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('major_quiz_questions', [
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
    ], { ignoreDuplicates: true });
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('major_quiz_questions', null, {});
  },
};

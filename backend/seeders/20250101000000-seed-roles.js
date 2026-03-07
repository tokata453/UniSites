'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('roles', [
      { name: 'student', description: 'Regular student user',              created_at: new Date(), updated_at: new Date() },
      { name: 'owner',   description: 'University or opportunity manager', created_at: new Date(), updated_at: new Date() },
      { name: 'admin',   description: 'Platform administrator',            created_at: new Date(), updated_at: new Date() },
    ], { ignoreDuplicates: true });
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('roles', null, {});
  },
};

'use strict';

const bcryptjs = require('bcryptjs');

module.exports = {
  async up(queryInterface) {
    const password = bcryptjs.hashSync('Sagzap@2024!', 10);

    await queryInterface.bulkInsert('new_users', [
      {
        id: 1,
        name: 'Super Admin',
        email: 'admin@sagzap.com.br',
        password,
        is_admin: true,
        is_email_verified: true,
        is_deleted: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ], { ignoreDuplicates: true });
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('new_users', { email: 'admin@sagzap.com.br' }, {});
  },
};

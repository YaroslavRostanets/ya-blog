'use strict';
const { faker } = require('@faker-js/faker');

module.exports = {
  async up (queryInterface, Sequelize) {
    const posts = [];
    for (let i = 0; i < 100; i++) {
      const fake = {
        title: faker.random.words(6),
        body: faker.random.words(200),
        userId: '1',
        img: '',
        createdAt: new Date(),
        updatedAt: new Date()
      }
      posts.push(fake);
    }
    return queryInterface.bulkInsert('Posts', posts)
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Posts', null, {});
  }
};

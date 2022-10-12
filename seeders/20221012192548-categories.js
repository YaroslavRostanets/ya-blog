'use strict';
const { faker } = require('@faker-js/faker');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const categories = [];
    for (let i = 0; i < 25; i++) {
      const name = faker.random.words(1);
      const fake = {
        name: name,
        label: name,
        published: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      categories.push(fake);
    }
    return queryInterface.bulkInsert('CategoryDictionary', categories)
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};

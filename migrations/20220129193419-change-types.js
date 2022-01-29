'use strict';
const withDateNoTz = require('sequelize-date-no-tz-postgres');

module.exports = {
  async up (queryInterface, SequelizeBase) {
    const Sequelize = withDateNoTz(SequelizeBase);

    return Promise.all([
      queryInterface.changeColumn('Users', 'createdAt', {
          type: Sequelize.DataTypes.DATE_NO_TZ,
      }),
      queryInterface.changeColumn('Users', 'updatedAt', {
        type: Sequelize.DataTypes.DATE_NO_TZ,
      }),
      queryInterface.changeColumn('Posts', 'createdAt', {
        type: Sequelize.DataTypes.DATE_NO_TZ,
      }),
      queryInterface.changeColumn('Posts', 'updatedAt', {
        type: Sequelize.DataTypes.DATE_NO_TZ,
      })
    ])
  },

  async down (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.changeColumn('Users', 'createdAt', {
          type: Sequelize.DataTypes.DATE,
      }),
      queryInterface.changeColumn('Users', 'updatedAt', {
        type: Sequelize.DataTypes.DATE,
      }),
      queryInterface.changeColumn('Posts', 'createdAt', {
        type: Sequelize.DataTypes.DATE,
      }),
      queryInterface.changeColumn('Posts', 'updatedAt', {
        type: Sequelize.DataTypes.DATE,
      })
    ])
  }
};

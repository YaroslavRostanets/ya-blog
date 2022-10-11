const { Sequelize, DataTypes } = require('sequelize');
const database = require('../config/database');
const withDateNoTz = require('sequelize-date-no-tz-postgres');
const updDataTypes = withDateNoTz(DataTypes);

const Category = database.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(128),
    allowNull: false
  },
  label: {
    type: DataTypes.STRING(128),
    allowNull: false
  },
  published: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  createdAt: {
    allowNull: false,
    type: updDataTypes.DATE_NO_TZ,
  },
  updatedAt: {
    allowNull: false,
    type: updDataTypes.DATE_NO_TZ,
  }
});

Category.sync({ alter: true})

module.exports = Category;
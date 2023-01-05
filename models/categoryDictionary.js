const { DataTypes } = require('sequelize');
const database = require('../config/database');
const withDateNoTz = require('sequelize-date-no-tz-postgres');
const updDataTypes = withDateNoTz(DataTypes);
const CategoryToPost = require('./categoryToPost');

const CategoryDictionary = database.define('CategoryDictionary', {
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
}, {
  freezeTableName: true
});

CategoryDictionary.sync({ alter: true});
CategoryDictionary.getActiveCategories = ids => {
  return CategoryDictionary.findAll({
    attributes: ['name', 'label'],
    where: {
      published: true,
      id: ids
    }
  })
}

module.exports = CategoryDictionary;
'use strict';
const withDateNoTz = require('sequelize-date-no-tz-postgres');
const crypto = require('crypto');

const {
  DataTypes
} = require('sequelize');
const database = require("../config/database");

const tzDataTypes = withDateNoTz(DataTypes);

const User = database.define('User', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  firstName: DataTypes.STRING,
  lastName: DataTypes.STRING,
  email: DataTypes.STRING,
  login: DataTypes.STRING,
  passwordHash: DataTypes.STRING,
  createdAt: {
    allowNull: false,
    type: tzDataTypes.DATE_NO_TZ,
  },
  updatedAt: {
    allowNull: false,
    type: tzDataTypes.DATE_NO_TZ,
  }
}, {
  freezeTableName: true
});

User.getUser = async function (login, password) {
  // const passwordHash = crypto.createHash('md5').update(password).digest("hex");
  const passwordHash = password;
  return await User.findOne({
    attributes: ['id', 'firstName', 'lastName'],
    limit: 1,
    raw: true,
    where: {login: login, passwordHash}
  });
};

module.exports = User;
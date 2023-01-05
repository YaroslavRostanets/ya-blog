'use strict';
const {
  DataTypes
} = require('sequelize');
const withDateNoTz = require('sequelize-date-no-tz-postgres');
const tzDataTypes = withDateNoTz(DataTypes);
const database = require("../config/database");
const moment = require('moment');

const Contact = database.define('Contact', {
  name: {
    type: DataTypes.STRING(128),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(128),
    allowNull: false
  },
  subject:{
    type: DataTypes.STRING(128),
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  createdAt: {
    allowNull: false,
    type: tzDataTypes.DATE_NO_TZ,
    defaultValue: moment().utc().format('DD-MM-YYYY HH:mm')
  }
}, {
  freezeTableName: true,
  timestamp: false
});

Contact.sync({alter: true});

module.exports = Contact;
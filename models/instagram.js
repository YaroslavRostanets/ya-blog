'use strict';
const {
  DataTypes, literal
} = require('sequelize');
const withDateNoTz = require('sequelize-date-no-tz-postgres');
const updDataTypes = withDateNoTz(DataTypes);
const database = require("../config/database");

const Instagram = database.define('Instagram', {
  id: {
    type: DataTypes.STRING(32),
    primaryKey: true
  },
  media_url: {
    type: DataTypes.STRING(2048),
    allowNull: false
  },
  createdAt: {
    allowNull: false,
    type: updDataTypes.DATE_NO_TZ,
    defaultValue:  literal(`CURRENT_TIMESTAMP`),
  },
  timestamp: {
    allowNull: false,
    type: updDataTypes.DATE_NO_TZ
  }
}, {
  freezeTableName: true,
  timestamps: false
});

module.exports = Instagram;
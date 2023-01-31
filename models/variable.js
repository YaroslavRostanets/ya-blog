'use strict';
const withDateNoTz = require('sequelize-date-no-tz-postgres');
const crypto = require('crypto');

const {
  DataTypes,
  literal
} = require('sequelize');
const database = require("../config/database");

const tzDataTypes = withDateNoTz(DataTypes);

const Variable = database.define('Variable', {
  key: {
    allowNull: false,
    primaryKey: true,
    type: DataTypes.STRING(256)
  },
  value: DataTypes.STRING(1024),
  updatedAt: {
    allowNull: false,
    type: tzDataTypes.DATE_NO_TZ,
    defaultValue: literal('current_timestamp')
  }
}, {
  freezeTableName: true,
  tableName: 'Variable',
  timestamps: false
});

Variable.getValue = async function (key) {
  const res = await Variable.findOne({
    attributes: ['value', 'updatedAt'],
    where: {
      key
    },
    raw: true
  });
  return res ? res.value : null;
};

Variable.setValue = async function (key, value) {
  let variable = await Variable.findOne({
    where: {
      key
    },
  });
  if (variable) {
    await Variable.update({
      value
    }, {
      where: {
        key
      }
    })
  } else {
    variable = await Variable.create({
      key,
      value
    }, {
      returning: true
    })
  }
  return variable;
};

module.exports = Variable;
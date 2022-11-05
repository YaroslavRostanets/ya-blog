const {DataTypes} = require('sequelize');
const database = require('../config/database');
const withDateNoTz = require('sequelize-date-no-tz-postgres');
const updDataTypes = withDateNoTz(DataTypes);

const File = database.define('File', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  uuid: {
    type: DataTypes.UUID,
    allowNull: false,
    defaultValue: DataTypes.UUIDV4
  },
  name: {
    type: DataTypes.STRING(127),
    allowNull: false
  },
  type: {
    type: DataTypes.STRING(64),
    allowNull: false
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  path: {
    type: DataTypes.STRING(255),
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

File.sync({alter: true});

File.getByIds = ids => {
  return File.findAll({
    attributes: ['id', 'name', 'size', 'path'],
    where: {
      id: ids
    },
    raw: true
  })
};

File.getById = id => {
  return File.findOne({
    attributes: ['name', 'size', 'path'],
    where: {
      id
    },
    raw: true
  })
};

File.rmByPath = (transaction, filePath) => {
  return File.destroy({
    transaction,
    where: {
      path: filePath
    }
  })
};

File.rmById = (transaction, id) => {
  return File.destroy({
    transaction,
    where: {
      id
    }
  })
};

module.exports = File;
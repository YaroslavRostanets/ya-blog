'use strict';
const {
  Model, DataTypes
} = require('sequelize');
const withDateNoTz = require('sequelize-date-no-tz-postgres');
const db = require('../config/database');
const tzDataTypes = withDateNoTz(DataTypes);

class Post extends Model {
  static associate(models) {
    console.log('as: ', models)
  }
}

Post.init({
  title: DataTypes.STRING,
  announcement: {
    type: DataTypes.STRING(2048),
    allowNull: false
  },
  body: DataTypes.TEXT,
  img: DataTypes.STRING,
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  published: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  createdAt: {
    allowNull: false,
    type: tzDataTypes.DATE_NO_TZ,
  },
  updatedAt: {
    allowNull: false,
    type: tzDataTypes.DATE_NO_TZ,
  }
}, {
  sequelize: db,
  modelName: 'Post',
});

Post.sync({ alter: true })

module.exports = Post;
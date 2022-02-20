'use strict';
const withDateNoTz = require('sequelize-date-no-tz-postgres');
const db = require('../config/database');
const Post = require('./post');
const crypto = require('crypto');

const {
  Model, DataTypes
} = require('sequelize');

const tzDataTypes = withDateNoTz(DataTypes);

  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      console.log('m: ', models)
    }
  }
  User.init({
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
    sequelize: db,
    modelName: 'User',
  });

  User.hasMany(Post, {foreignKey: 'userId'});
  Post.belongsTo(User, {foreignKey: 'userId'});
  User.sync({ alter: true })
  
  User.getUser = async function (login, password) {
    console.log('l: ', login)
    console.log('p: ', password)
    const passwordHash = crypto.createHash('md5').update(password).digest("hex");
    return await User.findOne({
      attributes: ['id', 'firstName', 'lastName'],
      limit: 1,
      raw: true,
      where: { login: login, passwordHash }
    });
  };

  module.exports = User;
'use strict';
const withDateNoTz = require('sequelize-date-no-tz-postgres');
const db = require('../config/database');
const Post = require('./post');
console.log('p: ', Post)

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
  
  

  module.exports = User;
'use strict';
const {
  DataTypes
} = require('sequelize');
const withDateNoTz = require('sequelize-date-no-tz-postgres');
const tzDataTypes = withDateNoTz(DataTypes);
const File = require('./file');
const CategoryToPost = require('./categoryToPost');
const database = require("../config/database");

const Post = database.define('Post', {
  title: DataTypes.STRING,
  announcement: {
    type: DataTypes.STRING(2048),
    allowNull: false
  },
  body: DataTypes.TEXT,
  previewId:{
    type: DataTypes.BIGINT,
    allowNull: false
  },
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

});

Post.sync({ alter: true });
Post.hasOne(CategoryToPost);
Post.hasOne(File, {
  foreignKey: 'previewId'
});

Post.getById = id => {
  return Post.findOne({
    where: {
      id
    },
    raw: true
  })
};

Post.createBlank = (transaction, userId, title, announcement) => {
  return Post.create({
    title,
    announcement,
    userId: userId,
    published: false,
    previewId: 0
  }, {
    transaction,
    returning: true
  });
};

module.exports = Post;
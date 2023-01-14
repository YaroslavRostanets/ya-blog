const CategoryDictionary = require('../models/categoryDictionary');
const CategoryToPost = require('../models/categoryToPost');
const Post = require('../models/post');
const User = require('../models/user');

const setModelRelations = async () => {
  await CategoryToPost.belongsTo(CategoryDictionary, {
    foreignKey: 'categoryDictionaryId'
  });
  await Post.hasMany(CategoryToPost, {
    foreignKey: 'postId'
  });
  await User.hasMany(Post, {foreignKey: 'userId'});
  await Post.belongsTo(User, {foreignKey: 'userId'});
};

module.exports = setModelRelations;
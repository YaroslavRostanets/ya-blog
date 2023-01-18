const CategoryDictionary = require('../models/categoryDictionary');
const Contact = require('../models/contact');
const File = require('../models/file');
const Post = require('../models/post');
const User = require('../models/user');
const Instagram = require('../models/instagram');

const modelSync = async () => {
  if (!process.env.MODEL_SYNC) {
    return false;
  }
  await CategoryDictionary.sync({ alter: true});
  await Contact.sync({alter: true});
  await File.sync({alter: true});
  await Post.sync({ alter: true });
  await User.sync({ alter: true });
  await Instagram.sync({ alter: true });
}

module.exports = modelSync;
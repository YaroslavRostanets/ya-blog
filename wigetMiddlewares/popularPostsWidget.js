const moment = require('moment');
const Post = require('../models/post');
const File = require('../models/file');

module.exports = async function (req, res, next) {
  const popularPosts = await Post.findAll({
    attributes: ['title', 'previewId', 'furl', 'createdAt'],
    order: [
      ['title', 'DESC']
    ],
    limit: 2,
    raw: true
  });
  const previews = await File.findAll({
    attributes: ['id', 'path'],
    where: {
      id: popularPosts.map(item => item.previewId)
    }
  });

  req.popularPosts = popularPosts.map(item => {
    return {
      ...item,
      createdAt: moment(item.createdAt).format('DD.MM.YYYY'),
      preview: previews.find(prev => String(prev.id) === String(item.previewId)).path
    }
  });
  next();
}
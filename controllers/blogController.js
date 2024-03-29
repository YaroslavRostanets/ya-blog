const { Op } = require('sequelize');
const Post = require('../models/post');
const User = require('../models/user');
const CategoryDictionary = require("../models/categoryDictionary");
const CategoryToPost = require('../models/categoryToPost');
const moment = require("moment");
const Joi = require("joi");
const db = require('../config/database');
const PostClass = require('../classes/Post');
const File = require('../models/file');

const getList = async (req, res, next) => {
  const perPage = 4;
  const title = 'Blog';
  let page = 1;
  let category = null;
  const params = Object.values(req.params).filter(i => i);
  if (params.length === 2) {
    category = params[0].toLowerCase();
    page = Number(params[1].replace('page', ''));
  } else if (params.length === 1) {
    const isPage = params[0].match(/page\d/);
    page = isPage ? Number(params[0].replace('page', '')) : 1;
    category = isPage ? null : params[0];
  }
  const categoryDict = await CategoryDictionary.findOne({
    attributes: ['id'],
    where: {
      code: category,
      published: true
    }
  });

  if (category && !categoryDict) {
    return next();
  }

  const categoryInclude = categoryDict ? [{
    model: CategoryToPost,
    where: {
      categoryDictionaryId: categoryDict.id
    }}] : [];

  let list = await Post.findAll({
    attributes: ['id', 'title', 'announcement', 'body', 'previewId', 'furl', 'views', 'createdAt'],
    order: [['id', 'DESC']],
    limit: perPage,
    offset: (page - 1) * perPage,
    raw: true,
    include: [{
      model: User,
      required: false,
      attributes: ['firstName', 'lastName']
    }, ...categoryInclude],
    where: {
      published: true
    }
  });

  const previews = await File.getByIds(list.map(item => item.previewId));
  const categories = await CategoryToPost.findAll({
    attributes: ['postId'],
    raw: true,
    where: {
      postId: list.map(item => item.id)
    },
    include: [{
      model: CategoryDictionary,
      required: false,
      attributes: ['label', 'code']
    }],
  });
  list = list.map(item => ({
    ...item,
    categories: categories.filter(category => category.postId === item.id),
    previewSrc: previews.find(pr => String(pr.id) === String(item.previewId)).path
  }));

  const count = await Post.count({
    where: {
      published: true
    },
    include: categoryInclude
  });

  console.log('COUNT: ', count);

  res.render('blogList/index', {
    title,
    list,
    categories: req.categories,
    popularPosts: req.popularPosts,
    instagram: req.instagram,
    pagination: {
      current: page,
      perPage: perPage,
      count: count,
      pages: Math.ceil(count / perPage),
      baseUrl: `/blog` + (category ? `/${category}` : '')
    },
    meta: {
      type: 'website',
      title: 'Всі публікації блогу',
      description: 'Мій особистий блог. DIY, архітектура, подорожі, політика і все, що мене цікавить',
      url: req.protocol + '://' + req.get('host') + '/blog/',
      image: req.protocol + '://' + req.get('host') + '/home/img/avatar.jpg'
    }
  });
};

const getListAll = async (req, res) => {
  const perPage = 15;
  let page = req.params.page ? Number(req.params.page.replace('page', '')) : 1;
  const count = await Post.count();
  const posts = await Post.findAll({
    attributes: ['id', 'title', 'previewId', 'userId', 'published', 'createdAt'],
    limit: perPage,
    offset: (page - 1) * perPage,
    raw: true,
    userId: req.session.userId,
    order: [
      ['id', 'DESC'],
    ]
  });
  const previews = await File.findAll({
    where: {
      id: posts.map(post => post.previewId)
    },
    attributes: ['id', 'path'],
    limit: perPage,
    raw: true
  });


  const catItems = posts.map(post => {
    const preview = previews.find(prev => Number(prev.id) === Number(post.previewId));
    return {
      ...post,
      img: {
        type: 'image',
        src: preview ? preview.path : ''
      },
      createdAt: moment(post.createdAt).format('DD-MM-YYYY HH:mm'),
      published: {
        type: 'checkbox',
        value: post.published,
        toggleUrl: '/admin/post/set-published'
      },
      edit: {
        type: 'button',
        link: `/admin/post/edit/${post.id}`,
        buttonType: 'primary',
        icon: 'glyphicon-pencil',
        btnClass: ''
      },
      delete: {
        type: 'button',
        link: `/admin/post/delete/${post.id}`,
        buttonType: 'danger',
        icon: 'glyphicon-remove',
        btnClass: 'js-remove-item'
      }
    }
  });

  res.render('admin/list', {
    title: 'Всі публікації',
    fields: ['id', 'title', 'img', 'published', 'createdAt', 'edit', 'delete'],
    items: catItems,
    pagination: {
      current: page,
      perPage: perPage,
      count: count,
      pages: Math.ceil(count / perPage),
      baseUrl: `/admin/post`
    },
  });
};

const editPost = async (req, res) => {
  const postId = req.params.postId;
  const categories = await CategoryDictionary.findAll({
    attributes: ['id', 'label'],
    raw: true
  });
  if (postId) {
    const post = await Post.getById(req.params.postId);
    const preview = await File.getById(post.previewId);
    const postCategories = await CategoryToPost.getByPostId(post.id);
    const cat = categories.map(cat => ({... cat, selected: postCategories.some(postCat => postCat.categoryDictionaryId === cat.id)}));
    const { name, size } = preview;
    res.render('admin/editPost', {
      id: post.id,
      title: post.title,
      furl: post.furl,
      keywords: post.keywords,
      categories: cat,
      preview: JSON.stringify({ name, size, file: preview.path}),
      announcement: post.announcement,
      editor: post.body,
      published: post.published,
      errors: {}
    });
  } else {
    res.render('admin/editPost', {
      id: '',
      title: '',
      furl: '',
      keywords: '',
      categories,
      preview: '',
      announcement: '',
      editor: '',
      published: req.body.published === 'on',
      errors: {}
    });
  }
};

const updatePost = async (req, res) => {
  const furlExist = await Post.findOne({
    attributes: ['id'],
    where: {
      [Op.and]: {
        furl: req.body.furl,
        id: {
          [Op.not]: req.body.id || '0'
        }
      }
    }
  });
  const schema = Joi.object({
    id: Joi.string().min(0),
    preview: Joi.string().required(),
    title: Joi.string().required(),
    furl: Joi.string().custom((value, helpers) => {
      if (furlExist) {
        return helpers.message('friendly url must be unique')
      }
      return value;
    }).required(),
    keywords: Joi.string().required(),
    announcement: Joi.string().required(),
    editor: Joi.string().required(),
    categories: Joi.alternatives().try(Joi.array().items(Joi.string()).required(), Joi.string().required()),
    published: Joi.string().valid('on')
  });
  req.body.categories = Array.isArray(req.body.categories) ? req.body.categories : [req.body.categories];
  const {id, title, preview, announcement, editor, published, categories, furl, keywords} = req.body;
  const {value, error} = schema.validate(req.body, {abortEarly: false});
  if (error) {
    console.log('ERROR: ', error);
    const errors = error.details.reduce((acc, item) => {
      acc[item.path[0]] = item.message;
      return acc;
    }, {});
    const categories = await CategoryDictionary.findAll({
      attributes: ['id', 'label', 'code'],
      raw: true
    });
    const cat = req.body.categories
      ? categories.map(cat => ({...cat, selected: req.body.categories.some(postCatId => String(postCatId) === String(cat.id))}))
      : categories;
    res.render('admin/editPost', {
      ...req.body,
      title: title,
      furl: req.body.furl,
      keywords: req.body.keywords,
      announcement: req.body.announcement,
      published: req.body.published === 'on',
      editor: req.body.editor,
      categories: cat,
      errors: errors
    });
  } else {
    const post = new PostClass(id, preview, title, editor, announcement, published, categories, furl, keywords, req.session.userId);
    console.log('post: ', post);
    if (req.body.id) {
      await post.update();
    } else {
      await post.save();
    }
    res.redirect('/admin/post');
  }
};

const setPublished = async (req, res) => {
  await Post.update({
    published: req.body.published
  }, {
    where: {
      id: req.params.postId
    }
  });
  res.json({status: 'ok'});
};

const deletePost = async (req, res) => {
  const {postId} = req.params;
  await PostClass.removePost(postId);
  res.redirect('back');
};

const detail = async (req, res) => {
  const post = await Post.findOne({
    where: {
      furl: req.params.furl
    }
  });
  const preview = await File.findOne({
    attributes: ['path'],
    where: {
      id: post.previewId
    }
  });

  const categories = await CategoryToPost.findAll({
    attributes: ['postId'],
    raw: true,
    where: {
      postId: post.id
    },
    include: [{
      model: CategoryDictionary,
      required: false,
      attributes: ['label', 'code']
    }],
  });

  await Post.viewIncrement(post.id, post.views);

  res.render('blogList/detail', {
    title: post.title,
    body: post.body,
    preview: preview.path,
    views: post.views,
    popularPosts: req.popularPosts,
    categories: req.categories,
    postCategories: categories,
    createdAt: moment(post.createdAt).format('DD.MM.YYYY'),
    instagram: req.instagram,
    meta: {
      type: 'article',
      title: post.title,
      keywords: post.keywords,
      description: post.announcement,
      url: req.protocol + '://' + req.get('host') + '/blog/detail/' + post.furl,
      image: req.protocol + '://' + req.get('host') + preview.path
    }
  });
};

module.exports = {
  getList,
  getListAll,
  editPost,
  updatePost,
  setPublished,
  deletePost,
  detail
}
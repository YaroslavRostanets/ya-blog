const Post = require('../models/post');
const User = require('../models/user');
const CategoryDictionary = require("../models/categoryDictionary");
const CategoryToPost = require('../models/categoryToPost');
const moment = require("moment");
const Joi = require("joi");
const db = require('../config/database');
const PostClass = require('../classes/Post');
const File = require('../models/file');

const getList = async (req, res) => {
  const perPage = 4;
  const title = 'Blog';
  let page = 1;
  let category = null;
  const params = Object.values(req.params).filter(i => i);
  if (params.length === 2) {
    category = params[0];
    page = Number(params[1].replace('page', ''));
  } else if (params.length === 1) {
    const isPage = params[0].match(/page\d/);
    page = isPage ? Number(params[0].replace('page', '')) : 0;
    category = isPage ? null : params[0];
  }
  // ToDo model method
  const list = await Post.findAll({
    attributes: ['title', 'body', 'previewId', 'createdAt'],
    order: [['id', 'DESC']],
    limit: perPage,
    offset: (page - 1) * perPage,
    raw: true,
    include: {
      model: User,
      required: false,
      attributes: ['firstName', 'lastName']
    },
    where: {
      published: true
    }
  });

  const count = await Post.count()

  res.render('blogList/index', {
    title,
    list,
    pagination: {
      current: page,
      perPage: perPage,
      count: count,
      pages: Math.ceil(count / perPage),
      baseUrl: `/blog` + (category ? `/${category}` : '')
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
    console.log('prev: ', preview)
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

  console.log('catItems: ', catItems);

  res.render('admin/list', {
    title: 'Post list',
    fields: ['id', 'title', 'img', 'published', 'createdAt', 'edit', 'delete'],
    items: catItems,
    pagination: {
      current: page,
      perPage: perPage,
      count: count,
      pages: Math.ceil(count / perPage),
      baseUrl: `/admin/post`
    }
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
      categories,
      preview: '',
      announcement: '',
      editor: '',
      published: false,
      errors: {}
    });
  }
};

const updatePost = async (req, res) => {
  console.log('REQ_BODY: ', req.body);
  const schema = Joi.object({
    id: Joi.string().min(0),
    preview: Joi.string().required(),
    title: Joi.string().required(),
    announcement: Joi.string().required(),
    editor: Joi.string().required(),
    categories: Joi.array().items(Joi.string()).required()
  });
  const {value, error} = schema.validate(req.body, {abortEarly: false});
  if (error) {
    console.log('ERROR: ', error);
    const errors = error.details.reduce((acc, item) => {
      acc[item.path[0]] = item.message;
      return acc;
    }, {});
    const categories = await CategoryDictionary.findAll({
      attributes: ['id', 'label'],
      raw: true
    });
    const cat = req.body.categories
      ? categories.map(cat => ({...cat, selected: req.body.categories.some(postCatId => String(postCatId) === String(cat.id))}))
      : categories;
    res.render('admin/editPost', {
      ...req.body,
      title: 'Post edit',
      announcement: req.body.announcement,
      published: req.body.published === 'on',
      editor: req.body.editor,
      categories: cat,
      errors: errors
    });
  } else {
    const {id, title, preview, announcement, editor, categories} = req.body;
    const post = new PostClass(id, preview, title, editor, announcement, categories);
    console.log('post: ', post);
    if (req.body.id) {
      // ToDo зробити update
      await post.update();
    } else {
      await post.save();
    }
    res.send(req.body);
  }
};

const setPublished = async (req, res) => {
  console.log('SP: ', req.body.published, req.params.postId);
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
  await Post.destroy({
    where: {
      id: postId
    }
  });
  res.redirect('back');
};

module.exports = {
  getList,
  getListAll,
  editPost,
  updatePost,
  setPublished,
  deletePost
}
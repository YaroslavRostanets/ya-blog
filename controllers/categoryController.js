const moment = require('moment');
const CategoryDictionary = require('../models/categoryDictionary');
const Joi = require("joi");

const getList = async (req, res) => {
  const perPage = 15;
  let page = req.params.page ? Number(req.params.page.replace('page', '')) : 1;
  const count = await CategoryDictionary.count({
    where: {
      published: true
    }
  });
  const categories = await CategoryDictionary.findAll({
    attributes: ['id', 'label', 'createdAt', 'published'],
    limit: perPage,
    offset: (page - 1) * perPage,
    raw: true,
    order: [
      ['id', 'ASC'],
    ]
  });
  const catItems = categories.map(category => {
    return {
      ...category,
      createdAt: moment(category.createdAt).format('DD-MM-YYYY HH:mm'),
      published: {
        type: 'checkbox',
        value: category.published,
        toggleUrl: '/admin/category/set-published'
      },
      edit: {
        type: 'button',
        link: `/admin/category/edit/${category.id}`,
        buttonType: 'primary',
        icon: 'glyphicon-pencil',
        btnClass: ''
      },
      delete: {
        type: 'button',
        link: `/admin/category/delete/${category.id}`,
        buttonType: 'danger',
        icon: 'glyphicon-remove',
        btnClass: 'js-remove-item'
      }
    }
  });

  res.render('admin/list', {
    title: 'Category list',
    fields: catItems ? Object.keys(catItems[0]) : [],
    items: catItems,
    pagination: {
      current: page,
      perPage: perPage,
      count: count,
      pages: Math.ceil(count/perPage),
      baseUrl: `/admin/category`
    }
  });
};

const editCategory = async (req, res) => {
  const { categoryId } = req.params;
  let category = {
    id: '',
    label: '',
    published: true
  };
  if (categoryId) {
    category = await CategoryDictionary.findOne({
      attributes: ['id', 'label', 'published'],
      raw: true,
      where: {
        id: categoryId
      }
    });
  }
  console.log('cat: ', category);
  console.log('params: ', req.params);
  res.render('admin/editCategory', {
    title: 'Category edit',
    errors: {},
    ...category
  });
};

const updateCategory = async (req, res) => {
  const schema = Joi.object({
    id: Joi.string().required(),
    label: Joi.string().min(3).required(),
    published: Joi.string().valid('on')
  });
  const {value, error} = schema.validate(req.body, {abortEarly: false});
  if (error) {
    const errors = error.details.reduce((acc, item) => {
      acc[item.path[0]] = item.message;
      return acc;
    }, {});
    console.log('err: ', errors)
    return res.render('admin/editCategory', {
      title: 'Category edit',
      ...req.body,
      published: req.body.published === 'on',
      errors
    });
  } else {
    await CategoryDictionary.update({
      published: req.body.published === 'on',
      label: req.body.label
    }, {
      where: {
        id: req.body.id
      }
    })
    res.redirect('/admin/category');
  }
};

const deleteCategory = async (req, res) => {
  const {categoryId} = req.params;
  await CategoryDictionary.destroy({
    where: {
      id: categoryId
    }
  });
  res.redirect('back');
};

const setPublished = async (req, res) => {
  await CategoryDictionary.update({
    published: req.body.published
  }, {
    where: {
      id: req.params.categoryId
    }
  });
  res.json({status: 'ok'});
};

module.exports = {
  getList,
  editCategory,
  updateCategory,
  deleteCategory,
  setPublished
}
const moment = require('moment');
const CategoryDictionary = require('../models/categoryDictionary');
const Joi = require("joi");

const getList = async (req, res) => {
  const categories = await CategoryDictionary.findAll({
    attributes: ['id', 'label', 'createdAt', 'published'],
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
        value: category.published
      },
      edit: {
        type: 'button',
        link: `category/edit/${category.id}`,
        buttonType: 'primary',
        icon: 'glyphicon-pencil'
      },
      delete: {
        type: 'button',
        link: `category/delete/${category.id}`,
        buttonType: 'danger',
        icon: 'glyphicon-remove'
      }
    }
  });
  console.log('cat: ', categories);
  console.log('keys: ', Object.keys(catItems[0]))
  res.render('admin/list', {
    title: 'Category list',
    fields: Object.keys(catItems[0]),
    items: catItems
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
    res.render('admin/editCategory', {
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

module.exports = {
  getList,
  editCategory,
  updateCategory
}
const Joi = require("joi");
const Contact = require('../models/contact');
const CategoryDictionary = require("../models/categoryDictionary");
const moment = require("moment");

const messages = {
  'string.empty': `Не може бути пустим`,
  'any.required': `Обов'язкове поле`,
  'string.email': 'Не валідний email',
  'string.min': 'Мінімальна довжина - 3 символа'
};

const sendMessage = async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(128).required().messages(messages),
    email: Joi.string().max(128).email({ tlds: { allow: false } }).required().messages(messages),
    subject: Joi.string().max(128).messages(messages),
    message: Joi.string().required().messages(messages)
  });
  const {value, error} = schema.validate(req.body, {abortEarly: false});
  if (error) {
    const errors = error.details.reduce((acc, item) => {
      acc[item.path[0]] = item.message;
      return acc;
    }, {});
    res.status(400).json(errors);
  } else {
    const message = await Contact.create(req.body);
    res.json(message);
  }
};

const getList = async (req, res) => {
  const perPage = 15;
  let page = req.params.page ? Number(req.params.page.replace('page', '')) : 1;
  const count = await Contact.count();
  const contacts = await Contact.findAll({
    attributes: ['id', 'name', 'email', 'subject', 'message', 'createdAt'],
    limit: perPage,
    offset: (page - 1) * perPage,
    raw: true,
    order: [
      ['id', 'DESC'],
    ]
  });
  const conItems = contacts.map(contact => {
    return {
      ...contact,
      createdAt: moment(contact.createdAt).format('DD-MM-YYYY HH:mm'),
      delete: {
        type: 'button',
        link: `/admin/contact/delete/${contact.id}`,
        buttonType: 'danger',
        icon: 'glyphicon-remove',
        btnClass: 'js-remove-item'
      }
    }
  });

  res.render('admin/list', {
    title: 'Contact list',
    fields: conItems.length ? Object.keys(conItems[0]) : [],
    items: conItems,
    pagination: {
      current: page,
      perPage: perPage,
      count: count,
      pages: Math.ceil(count/perPage),
      baseUrl: `/admin/contact`
    }
  });
};

module.exports = {
  sendMessage,
  getList
}
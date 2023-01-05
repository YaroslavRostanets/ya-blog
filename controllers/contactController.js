const Joi = require("joi");
const Contact = require('../models/contact');

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
}

module.exports = {
  sendMessage
}
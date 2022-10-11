const Joi = require('joi');
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Category = require('../models/category');

router.post('/add-post', (req, res) => {
    const schema = Joi.object({
        preview: Joi.string().required(),
        title: Joi.string().required(),
        announcement: Joi.string().required(),
        editor: Joi.string().required()
    });
    const { value, error } = schema.validate(req.body, { abortEarly: false });
    console.log('ERRORS: ', error.details);
    if (error) {
        res.render('admin/addPost', { errors: [] });
    }
    // ToDo Валідація
    // ToDo Якщо помилка - повернути список помилок
    // ToDo Якщо все ок, Створюємо транзакцію
    // ToDo створюємо запис про публікацію
    // ToDo створити список категорій
    // ToDo створюємо запис про категорію
    // ToDo Переносимо файли публікації в папку
    // ToDo Коміт транзакції
    res.render('admin/addPost', { errors: error.details })
});

router.get('/add-post', (req, res) => {
    console.log('req: ', req.body);
    res.render('admin/addPost');
});

router.get('/logout', (req, res) => {
    req.session.destroy(null);
    res.status(401).redirect('/admin');
});

router.get('/', (req, res) => {
    const { userId } = req.session;
    console.log('USR: ', userId)
    res.setHeader('Last-Modified', (new Date()).toUTCString());
    if (userId) {
        res.render('admin/index')
    } else {
        res.render('admin/login', { login: '' })
    }
});

router.post('/', async (req, res) => {
    const { login, password } = req.body; 
    const user = await User.getUser(login, password);
    if (user) {
        req.session.userId = user.id;
        res.redirect('/admin');
    } else {
        res.render('admin/login', {
            login: req.body.login
        })
    }
});

module.exports = router;

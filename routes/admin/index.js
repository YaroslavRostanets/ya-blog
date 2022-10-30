const Joi = require('joi');
const express = require('express');
const router = express.Router();
const category = require('./category');
const post = require('./post');
const User = require('../../models/user');
const CategoryDictionary = require('../../models/categoryDictionary');
const {noRawAttributes} = require("sequelize/lib/utils/deprecations");

router.use('/category', category);
router.use('/post', post);

router.get('/add-post', async (req, res) => {
  console.log('req: ', req.body);
  const categories = await CategoryDictionary.findAll({
    attributes: ['id', 'label'],
    raw: true
  });
  console.log('cat: ', categories)
  res.render('admin/editPost', {
    categories
  });
});

router.get('/logout', (req, res) => {
  req.session.destroy(null);
  res.status(401).redirect('/admin');
});

router.get('/', (req, res) => {
  const {userId} = req.session;
  console.log('USR: ', userId)
  res.setHeader('Last-Modified', (new Date()).toUTCString());
  res.render('admin/index');
});

router.get('/login', (req, res) => {
  res.render('admin/login', {
    login: ''
  });
});

router.post('/login', async (req, res) => {
  const {login, password} = req.body;
  const user = await User.getUser(login, password);
  if (user) {
    req.session.userId = user.id;
    res.redirect('/admin');
  } else {
    res.render('admin/login', {
      login: req.body.login
    });
  }
});

module.exports = router;

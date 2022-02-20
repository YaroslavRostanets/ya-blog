const express = require('express');
const router = express.Router();
const User = require('../models/user');

router.get('/add-post', (req, res) => {
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
        console.log('user_s: ', req.session.userId);
        res.redirect('/admin');
    } else {
        res.render('admin/login', {
            login: req.body.login
        })
    }
});

module.exports = router;

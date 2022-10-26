const Post = require('../models/post');
const User = require('../models/user');
const CategoryDictionary = require("../models/categoryDictionary");
const CategoryToPost = require('../models/categoryToPost');
const moment = require("moment");
const Joi = require("joi");
const db = require('../config/database');
const PostClass = require('../classes/Post');

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
        attributes: ['id', 'title', 'previewId', 'userId', 'createdAt'],
        limit: perPage,
        offset: (page - 1) * perPage,
        raw: true,
        order: [
            ['id', 'DESC'],
        ]
    });
    console.log('posts: ', posts);
    const catItems = posts.map(post => {
        return {
            ...post,
            img: '',
            createdAt: moment(post.createdAt).format('DD-MM-YYYY HH:mm'),
            edit: {
                type: 'button',
                link: `/admin/post/edit/${post.id}`,
                buttonType: 'primary',
                icon: 'glyphicon-pencil',
                btnClass: ''
            },
            delete: {
                type: 'button',
                link: `/admin/category/delete/${post.id}`,
                buttonType: 'danger',
                icon: 'glyphicon-remove',
                btnClass: 'js-remove-item'
            }
        }
    });

    res.render('admin/list', {
        title: 'Post list',
        fields: Object.keys(),
        items: catItems,
        pagination: {
            current: page,
            perPage: perPage,
            count: count,
            pages: Math.ceil(count / perPage),
            baseUrl: `/admin/category`
        }
    });
};

const editPost = async (req, res) => {
    // console.log('R: ', req.params.postId);
    // const post = await Post.getById(req.params.postId);
    // console.log('POST: ', post);
    const categories = await CategoryDictionary.findAll({
        attributes: ['id', 'label'],
        raw: true
    });
    console.log('cat: ', categories)
    res.render('admin/editPost', {
        categories,
        preview: '',
        errors: {}
    });
};

const updatePost = async (req, res) => {
    const schema = Joi.object({
        preview: Joi.string().required(),
        title: Joi.string().required(),
        announcement: Joi.string().required(),
        editor: Joi.string().required(),
        categories: Joi.array().items(Joi.string()).required()
    });
    console.log('BODY: ', req.body);
    const {value, error} = schema.validate(req.body, {abortEarly: false});
    if (error) {
        console.log('ERR: ', error);
        const errors = error.details.reduce((acc, item) => {
            acc[item.path[0]] = item.message;
            return acc;
        }, {});
        console.log('err: ', errors)
        const categories = await CategoryDictionary.findAll({
            attributes: ['id', 'label'],
            raw: true
        });
        res.render('admin/editPost', {
            ...req.body,
            title: 'Post edit',
            published: req.body.published === 'on',
            categories: categories,
            errors: errors
        });
    } else {
        const { title, preview, announcement, editor, categories } = req.body;
        const post = new PostClass(preview, title, editor, announcement, categories);
        console.log('post: ', post);
        post.save();
        res.send(req.body);
    }

    // ToDo створюємо запис про публікацію
    // ToDo створити список категорій
    // ToDo створюємо запис про категорію
    // ToDo Переносимо файли публікації в папку
    // ToDo Коміт транзакції
};

module.exports = {
    getList,
    getListAll,
    editPost,
    updatePost
}
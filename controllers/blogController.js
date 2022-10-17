const Post = require('../models/post');
const User = require('../models/user');
const CategoryDictionary = require("../models/categoryDictionary");
const moment = require("moment");

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
        attributes: ['title', 'body', 'img', 'createdAt'],
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
              pages: Math.ceil(count/perPage),
              baseUrl: `/blog` + (category ? `/${category}` : '')
          }
      });
};

const getListAll = async (req, res) => {
    const perPage = 15;
    let page = req.params.page ? Number(req.params.page.replace('page', '')) : 1;
    const count = await Post.count();
    const posts = await Post.findAll({
        attributes: ['id', 'title', 'img', 'userId', 'createdAt'],
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
        fields: Object.keys(catItems[0]),
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

module.exports = {
    getList,
    getListAll
}
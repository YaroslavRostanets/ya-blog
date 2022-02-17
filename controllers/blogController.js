const Post = require('../models/post');
const User = require('../models/user');

const getList = async (req, res) => {
    const perPage = 4;
    const title = 'Blog';
    let page = 1;
    let category = null;
    const params = Object.values(req.params).filter(i => i);
    console.log('P: ', params)
    if (params.length === 2) {
        category = params[0];
        
        page = Number(params[1].replace('page', ''));
        // 'page'.match(/page\d/);
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
          }
      });

    const count = await Post.count()
    console.log('count: ', count)

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
}

module.exports = {
    getList
}
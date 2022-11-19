const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const popularPostsWidget = require('../wigetMiddlewares/popularPostsWidget');
const categoryWidget = require('../wigetMiddlewares/catgoriyWiget');

router.get('/detail/:furl', [categoryWidget, popularPostsWidget, blogController.detail]);
router.get('/:var1?/:var2?', [categoryWidget, popularPostsWidget, blogController.getList]);


module.exports = router;

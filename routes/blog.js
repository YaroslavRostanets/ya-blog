const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const popularPostsWidget = require('../wigetMiddlewares/popularPostsWidget');
const categoryWidget = require('../wigetMiddlewares/catgoriyWiget');
const instagramWidget = require('../wigetMiddlewares/instagramWiget');

router.get('/detail/:furl', [instagramWidget, categoryWidget, popularPostsWidget, blogController.detail]);
router.get('/:var1?/:var2?', [instagramWidget, categoryWidget, popularPostsWidget, blogController.getList]);


module.exports = router;

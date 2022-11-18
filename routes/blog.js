const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const popularPostsWidget = require('../wigetMiddlewares/popularPostsWidget');

router.get('/detail/:furl', [popularPostsWidget, blogController.detail]);
router.get('/:var1?/:var2?', [popularPostsWidget, blogController.getList]);


module.exports = router;

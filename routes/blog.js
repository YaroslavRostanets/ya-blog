const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');

router.get('/:var1?/:var2?', blogController.getList);

module.exports = router;

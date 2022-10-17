const express = require('express');
const router = express.Router();
const blogController = require('../../controllers/blogController');

router.get('/:page?', blogController.getListAll);

module.exports = router;
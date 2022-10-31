const express = require('express');
const router = express.Router();
const blogController = require('../../controllers/blogController');
const categoryController = require("../../controllers/categoryController");

router.post('/edit/:postId?', blogController.updatePost);
router.get('/edit/:postId?', blogController.editPost);
router.get('/:page?', blogController.getListAll);
router.get('/delete/:postId', blogController.deletePost);
router.post('/set-published/:postId', blogController.setPublished);


module.exports = router;
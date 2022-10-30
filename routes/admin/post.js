const express = require('express');
const router = express.Router();
const blogController = require('../../controllers/blogController');

router.post('/edit/:postId?', blogController.updatePost);
router.get('/edit/:postId?', blogController.editPost);
router.get('/:page?', blogController.getListAll);
router.post('/set-published/:postId', blogController.setPublished);


module.exports = router;
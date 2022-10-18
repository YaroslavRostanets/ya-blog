const express = require('express');
const router = express.Router();
const blogController = require('../../controllers/blogController');

router.get('/edit/:postId?', blogController.editPost);
router.post('/edit/:postId?', blogController.updatePost);
router.get('/:page?', blogController.getListAll);


module.exports = router;
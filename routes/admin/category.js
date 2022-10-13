const express = require('express');
const router = express.Router();
const categoryController = require('../../controllers/categoryController');

router.get('/', categoryController.getList);
router.get('/edit/:categoryId?', categoryController.editCategory);
router.post('/edit/:categoryId?', categoryController.updateCategory);

module.exports = router;
const express = require('express');
const router = express.Router();
const categoryController = require('../../controllers/categoryController');

router.get('/edit/:categoryId?', categoryController.editCategory);
router.get('/:page?', categoryController.getList);
router.post('/edit/:categoryId?', categoryController.updateCategory);
router.get('/delete/:categoryId', categoryController.deleteCategory);
router.post('/set-published/:categoryId', categoryController.setPublished);

module.exports = router;
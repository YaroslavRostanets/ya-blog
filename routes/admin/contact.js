const express = require('express');
const router = express.Router();
const contactController = require('../../controllers/contactController');

// router.get('/edit/:categoryId?', categoryController.editCategory);
router.get('/:page?', contactController.getList);
// router.post('/edit/:categoryId?', categoryController.updateCategory);
// router.get('/delete/:categoryId', categoryController.deleteCategory);
// router.post('/set-published/:categoryId', categoryController.setPublished);

module.exports = router;
const router = require('express').Router();
const productController = require('./product.controller');

// get all products and filter product categories
router.get('/', (req, res, next) => {
    return productController.getAll(req, res, next);
});

// get one product by id
router.get('/:id', (req, res, next) => {
    return productController.getOne(req, res, next);
});

module.exports = router;
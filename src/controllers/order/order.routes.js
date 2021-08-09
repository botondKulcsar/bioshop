const router = require('express').Router();

const orderController = require('./order.controller');

// customer places an order
router.post('/', (req, res, next) => {
    return  orderController.create(req, res, next);
})

// get list of orders of a specific customer and sort it descending
router.get('/', (req, res, next) => {
    return orderController.get(req, res, next);
})

module.exports = router;
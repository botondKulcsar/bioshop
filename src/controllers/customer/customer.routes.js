const customerController = require('./customer.controller');
const checkForDDos = require('../../config/ipChecker');
const router = require('express').Router();


// get a single customer
router.get('/:id', (req, res, next) => {
    return customerController.findOne(req, res, next)
});

// customer updates his/her data
router.put('/:id', (req, res, next) => {
    return customerController.update(req, res, next);
});

module.exports = router;
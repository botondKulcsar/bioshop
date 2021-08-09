const authController = require('./auth.controller');
const checkForDDos = require('../../config/ipChecker');
const router = require('express').Router();
require('dotenv').config();


router.post('/register', checkForDDos, (req, res, next) => {
    return authController.register(req, res, next);
});
router.post('/login', checkForDDos, (req, res, next) => {
    return authController.login(req, res, next);
});
router.post('/refresh', checkForDDos, (req, res, next) => {
    return authController.refresh(req, res, next);
});
router.post('/logout', (req, res, next) => {
    return authController.logout(req, res, next);
});

module.exports = router;
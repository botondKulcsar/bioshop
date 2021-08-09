const createError = require('http-errors');
const logger = require('../config/logger');

const ipHashMap = {};

const previouslyAttempted = (ip) => {
    // whitelist localhost during testing comment out the 2 lines below afterwards
    if (ip === '::ffff:127.0.0.1' || ip === '::1') 
    return false;
    // commenting out ends here

    if(ipHashMap[ip]) {
        return true;
    } else {
        ipHashMap[ip] = Date.parse(new Date()) / 1000;
        return false;
    }
};
// TODO set timeout = 5 - during test
const requestApproved = ({ip, timeout = 5}) => {
    let result = '';
    if (previouslyAttempted(ip)) {
        if (Date.parse(new Date()) / 1000 - ipHashMap[ip] > timeout) {
            ipHashMap[ip] = new Date() / 1000;
            result = true;
        }
        else {
            result = false
        }
    } else {
        result = true;
    }
    return result;
}

const checkForDDos = (req, res, next) => {
    if (requestApproved({ ip: req.ip })) {
        return next()
    }
    logger.error(`${new Date().toUTCString()}, Request method: ${req.method}, path: ${req.originalUrl}, from IP address: ${req.ip}, request body: ${JSON.stringify(req.body)}, REASON: too frequent attempts attempts!`);
    return next(new createError.BadRequest('Too frequent attempts'));
}

module.exports = checkForDDos;
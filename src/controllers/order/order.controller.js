const orderService = require('./order.service')
const createError = require('http-errors');
const logger = require("../../config/logger");
const { isValidObjectId } = require('../../config/objectIdChecker')

// customer places an order
exports.create =  async (req, res, next) => {
    const { 
        customerId, 
        deliveryAddress: {
            firstName, lastName, phone, street, number, ZIP, city
        } = {},
        products,
        total,
        shipping
    } = req.body;
    // check for all fields are present
    if (!customerId || !firstName || !lastName || !phone || !street
        || !number || !ZIP || !city || !products.length || !total || !shipping) {
            logger.error(`${new Date().toUTCString()}, Request method: ${req.method}, path: ${req.originalUrl}, from IP address: ${req.ip}, request body: ${JSON.stringify(req.body)}`);
            return next(new createError.BadRequest(`Request body is missing required fields`));
    };
    
    if (!req.customerId) {
        return next(new createError.Unauthorized)
    }
    // we check if user tries to post in behalf of  other customer
    if(customerId !== req.customerId) {
        return next(new createError.Unauthorized('not yours'));
    }
    try {
        const newOrder = await orderService.create({ 
            date: new Date().toUTCString(),
            customerId, 
            deliveryAddress: {
                firstName, lastName, phone, street, number, ZIP, city
            },
            products,
            total,
            shipping
        });
       
        
        logger.info(`${new Date().toUTCString()}, Request method: ${req.method}, path: ${req.originalUrl}, from IP address: ${req.ip}, request body: ${JSON.stringify(req.body)}`)
        res.status(201);
        return res.json(newOrder);
        
    } catch (err) {
         // in case of db error
        logger.error(`${new Date().toUTCString()}, Request method: ${req.method}, path: ${req.originalUrl}, from IP address: ${req.ip}, request body: ${JSON.stringify(req.body)}`);
        return next(new createError.InternalServerError(err.message));
    }
};

// get list of orders of a specific customer and sort it descending
exports.get = async (req, res, next) => {
    const { customerId, _sort, _order } = req.query;
    if (!isValidObjectId(customerId)) {
        return next(new createError.BadRequest('invalid customerId'));
    }
    // we check if user tries to get other customers'  data
    if (!req.customerId) {
        return next(new createError.Unauthorized)
    }
    if(customerId !== req.customerId) {
        return next(new createError.Unauthorized('not yours'));
    }

    const sortCriterium = {};
    sortCriterium[_sort] = _order;
    try {
        const sortedList = await orderService.get({ customerId, sortCriterium });
        res.status(200);
        return res.json(sortedList);
    }
    catch (err) {
        console.log(err.message);
        logger.error(`${new Date().toUTCString()}, Request method: ${req.method}, path: ${req.originalUrl}, from IP address: ${req.ip}, request query: ${JSON.stringify(req.body)}`)
        return next(new createError.InternalServerError(err.message));
    }
};
const customerService = require("./customer.service");
const createError = require("http-errors");
const logger = require('../../config/logger');
const { isValidObjectId } = require('../../config/objectIdChecker');

const bcrypt = require('bcryptjs');
const saltRounds = 10;

// find one customer by id
exports.findOne = async (req, res, next) => {

  if (!isValidObjectId(req.params.id))
    return next(new createError.BadRequest('invalid id'));
  // we check if user tries to get other customers'  data
  if(req.params.id !== req.customerId)
    return next(new createError.Unauthorized('not yours'));

  try {
    const user = await customerService.findById(req.params.id);
    if (!user) {
      logger.error(
        `${new Date().toUTCString()}, Request method: ${req.method}, path: ${req.originalUrl
        }, from IP address: ${req.ip}`
      );
      return next(new createError.NotFound(`user id=${req.params.id} has not been found`));
    }

    const userCopy = JSON.parse(JSON.stringify(user));
    delete userCopy.password;

    res.status(200);
    return res.json(userCopy);

  } catch (err) {
    logger.error(
      `${new Date().toUTCString()}, Request method: ${req.method}, path: ${req.originalUrl
      }, from IP address: ${req.ip}`
    );
    console.log(err.message);
    return next(new createError.InternalServerError(err.message));
  }
};

// customer updates his/her data
exports.update = async (req, res, next) => {
  if (!isValidObjectId(req.params.id))
    return next(new createError.BadRequest('invalid id'));
  // we check if user tries to get other customers'  data
  if(req.params.id !== req.customerId)
    return next(new createError.Unauthorized('not yours'));
  try {
    
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, saltRounds);
    }
    const updatedUser = await customerService.update(req.params.id, req.body);
    if (!updatedUser) {
      logger.error(
        `${new Date().toUTCString()}, Request method: ${req.method}, path: ${req.originalUrl
        }, from IP address: ${req.ip}, request body: ${JSON.stringify(
          req.body
        )}`
      );
      return next(new createError.NotFound(`user id=${req.params.id} has not been found`));
    }

    logger.info(
      `${new Date().toUTCString()}, Request method: ${req.method}, path: ${req.originalUrl
      }, from IP address: ${req.ip}, request body: ${JSON.stringify(
        req.body
      )}`
    );
    
    res.status(200);
    return res.json(updatedUser);

  } catch (err) {
    logger.error(
      `${new Date().toUTCString()}, Request method: ${req.method}, path: ${req.originalUrl
      }, from IP address: ${req.ip}, request body: ${JSON.stringify(req.body)}`
    );
    return next(new createError.InternalServerError(err.message));
  }
};

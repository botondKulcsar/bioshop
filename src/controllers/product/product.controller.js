const productService = require("./product.service");
const createError = require("http-errors");
const logger = require("../../config/logger");
const { isValidObjectId } = require('../../config/objectIdChecker')

// get all products and filter product categories
exports.getAll = async (req, res, next) => {
  try {
   const products = await productService.findAll(req.query);
    if (products) {
      res.status(200);
      return res.json(products);
    }
  } catch (err) {
    logger.error(
      `${new Date().toUTCString()}, Request method: ${req.method}, path: ${
        req.originalUrl
      }, from IP address: ${req.ip}, request query: ${JSON.stringify(
        req.query
      )}`
    );
    return next(new createError.InternalServerError("Internal Server Error"));
  }
};

// get one product by id
exports.getOne = async (req, res, next) => {
  if (!isValidObjectId(req.params.id)) {
    return next(new createError.BadRequest('invalid id'));
  }
  try {
    const product = await productService.findOne(req.params.id);
    if (!product) {
      logger.error(
        `${new Date().toUTCString()}, Request method: ${req.method}, path: ${
          req.originalUrl
        }, from IP address: ${req.ip}`
      );
      return next(
        new createError.NotFound(`product id=${req.params.id} has not been found`)
      );
    }

    res.status(200);
    return res.json(product);
  } catch (err) {
    logger.error(
      `${new Date().toUTCString()}, Request method: ${req.method}, path: ${
        req.originalUrl
      }, from IP address: ${req.ip}`
    );
    return next(new createError.InternalServerError(err.message));
  }
};

// const customerService = require("./customer.service");
const authService = require("./auth.service");
const createError = require("http-errors");
const logger = require("../../config/logger");
const { expiresAt } = require("../../config/expiryInMilliSeconds");
require("dotenv").config();

const jwt = require("jsonwebtoken");

const bcrypt = require("bcryptjs");
const saltRounds = 10;

// register a new customer
exports.register = async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    password,
    address: { street, number, city, state, ZIP },
    phone,
  } = req.body;
  // if body is missing a field or so
  if (
    !firstName ||
    !lastName ||
    !email ||
    !password ||
    !street ||
    !number ||
    !city ||
    !state ||
    !ZIP ||
    !phone
  ) {
    logger.error(
      `${new Date().toUTCString()}, Request method: ${req.method}, path: ${
        req.originalUrl
      }, from IP address: ${req.ip}, request body: ${JSON.stringify(req.body)}`
    );
    return next(
      new createError.BadRequest(`Request body is missing required fields`)
    );
  }
  try {
    // check if email is unique
    const emailIsUnique = await authService.emailIsUnique(email);

    if (!emailIsUnique) {
      logger.error(
        `${new Date().toUTCString()}, Request method: ${req.method}, path: ${
          req.originalUrl
        }, from IP address: ${req.ip}, request body: ${JSON.stringify(
          req.body
        )}`
      );
      //   if email is already registered send response 'notUnique'
      return next(new createError.BadRequest("notUnique"));
    }
    const hashedPwd = await bcrypt.hash(password, saltRounds);
    const newUser = await authService.create({
      firstName,
      lastName,
      email,
      password: hashedPwd,
      address: { street, number, city, state, ZIP },
      phone,
    });
    if (!newUser) {
      return next(new createError.BadRequest("Request body field(s) failed to validate"))
    }
    res.status(201);
    return res.json({ email: newUser.email });
  } catch (err) {
    logger.error(
      `${new Date().toUTCString()}, Request method: ${req.method}, path: ${
        req.originalUrl
      }, from IP address: ${req.ip}, request body: ${JSON.stringify(req.body)}`
    );
    return next(new createError.InternalServerError(err.message));
  }
};

// customer logs in to the system
exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    logger.error(
      `${new Date().toUTCString()}, Request method: ${req.method}, path: ${
        req.originalUrl
      }, from IP address: ${req.ip}, request body: ${JSON.stringify(req.body)}`
    );
    return next(
      new createError.BadRequest("Request body is missing required parameters")
    );
  }

  try {
    const user = await authService.login(email);
    
    if (!user) {
      logger.error(
        `${new Date().toUTCString()}, Request method: ${req.method}, path: ${
          req.originalUrl
        }, from IP address: ${req.ip}, request body: ${JSON.stringify(
          req.body
        )}`
      );
      // return next( new createError.Unauthorized("user not registered"));
      return next(
        new createError.Unauthorized(
          "Submitted email-password combination is invalid"
        )
      );
    }
    // we check if the submitted pwd matches the one in the db
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return next(
        new createError.Unauthorized(
          "Submitted email-password combination is invalid"
        )
      );
    }

    logger.info(
      `${new Date().toUTCString()}, Request method: ${req.method}, path: ${
        req.originalUrl
      }, from IP address: ${req.ip}, request body: ${JSON.stringify(req.body)}`
    );

    //   generate an access token
    const accessToken = await jwt.sign(
      { _id: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.TOKEN_EXPIRY }
    );
    //   generate a refresh token
    const refreshToken = await jwt.sign(
      { _id: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_EXPIRY }
    );
    //   save the new refresh token
    const savedRefreshToken = await authService.saveToken(refreshToken);
    // check if save has been successful
    if (savedRefreshToken._id) {
      const userCopy = JSON.parse(JSON.stringify(user));
      delete userCopy.password;
      userCopy.accessToken = accessToken;
      userCopy.accessExpiresAt = expiresAt(process.env.TOKEN_EXPIRY);
      userCopy.refreshToken = refreshToken;

      res.status(200);
      return res.json(userCopy);
    } else {
      throw new Error("token not saved");
    }
  } catch (err) {
    // in case of server error
    console.log(err.message);
    logger.error(
      `${new Date().toUTCString()}, Request method: ${req.method}, path: ${
        req.originalUrl
      }, from IP address: ${req.ip}, request body: ${JSON.stringify(req.body)}`
    );
    return next(new createError.InternalServerError(err.message));
  }
};

// customer refreshes his/her token
exports.refresh = async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.sendStatus(401);
  }

  try {
    // check that refreshToken exists in db
    const tokenFromDB = await authService.findToken(refreshToken);
   
    
    // if no token found in db - user already logged out
    if (!tokenFromDB) {
      return res.sendStatus(403);
    }
    // if token exists in db we verify is it is ok
    const user = await jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    // we generate a new accessToken
    const accessToken = await jwt.sign(
      { _id: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.TOKEN_EXPIRY }
    );
    // we send the new accessToken and the moment of expiration
    const accessExpiresAt = expiresAt(process.env.TOKEN_EXPIRY);
    res.json({ accessToken, accessExpiresAt });
  } catch (err) {
    if (err.message === 'jwt expired') {
        return next(new createError.Forbidden(err.message))
    }
    return next(new createError.InternalServerError(err.message));
  }
};

// customer logs out of the system
exports.logout = async (req, res, next) => {
  const { refreshToken } = req.body;
  // if no token is sent
  if (!refreshToken) {
    return res.sendStatus(403);
  }

  try {
    // we delete the refreshToken from the db
    const { deletedCount } = await authService.deleteToken(refreshToken);
    if (deletedCount) {
      console.log("token found and deleted from DB");
      res.status(200);
      return res.json({});
    }
    throw new Error("already logged out");
  } catch (err) {
    if ((err.message = "already logged out")) {
      return next(new createError.Unauthorized("already logged out"));
    }
    return next(new createError.InternalServerError(err.message));
  }
};

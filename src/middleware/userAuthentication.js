require('dotenv').config();
const jwt = require('jsonwebtoken');

const secretKey = process.env.JWT_SECRET_KEY;

const userAuthentication = (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      return res.status(401).json({
        status: 'failed',
        message: 'You are not authorized to access this resource',
      });
    }

    const token = authorization.split(' ')[1];

    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        return res.status(403).json({
          status: 'failed',
          message: 'Invalid token. Please log in to access this resource',
        });
      }
      req.user = decoded;
      res.locals.email = req.user?.email;
      res.locals.id = req.user?.id;

      next();
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        status: 'failed',
        message: 'Token expired. Please log in again to access this resource',
      });
    }

    return res.status(500).json({
      status: 'failed',
      message: `Internal server error: ${error.message}`,
    });
  }
};

module.exports = userAuthentication;

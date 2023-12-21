require('dotenv').config();
const jwt = require('jsonwebtoken');

const secretKey = process.env.JWT_SECRET_KEY;
const refreshSecretKey = process.env.JWT_REFRESH_SECRET_KEY;

const handleRefreshToken = (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        status: 'failed',
        message: 'You are not authorized to access this resource',
      });
    }

    jwt.verify(refreshToken, refreshSecretKey, (err, decoded) => {
      if (err) {
        return res.status(403).json({
          status: 'failed',
          message: 'Invalid token. Please log in to access this resource',
        });
      }

      const accessToken = jwt.sign(
        { id: decoded.id, email: decoded.email },
        secretKey,
        {
          expiresIn: '1h',
        },
      );

      res.status(200).json({
        status: 'success',
        message: 'Token refreshed successfully',
        data: accessToken,
      });
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

module.exports = handleRefreshToken;

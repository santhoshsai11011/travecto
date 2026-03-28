const jwt = require('jsonwebtoken');
const { JWT_ACCESS_SECRET } = require('../config/env');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2) {
    return res.status(401).json({ success: false, message: 'Invalid token format' });
  }

  const token = parts[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET);

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
    req.userId = decoded.id;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      console.warn('Token expired for request:', req.originalUrl);
      return res.status(401).json({ success: false, message: 'token_expired' });
    }

    if (error.name === 'JsonWebTokenError') {
      console.warn('Invalid token for request:', req.originalUrl);
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    return res.status(401).json({ success: false, message: 'Authentication failed' });
  }
};

module.exports = { verifyToken };

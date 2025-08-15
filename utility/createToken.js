const jwt = require('jsonwebtoken');
const dotenv = require('dotenv'); 
dotenv.config();

// Create JWT token
const createToken = (userId, expiresIn = '7h') => {
  // Your controller passes userId directly, so we create the payload object here
  const payload = { id: userId };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: expiresIn,
  });
};
const verifyToken = (token) => {
  try {
   return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
     console.error("🧨 JWT verification failed:", error.message)
    throw new Error('Token verification error:', error);
  }
};

module.exports = {
  createToken,
  verifyToken,
};
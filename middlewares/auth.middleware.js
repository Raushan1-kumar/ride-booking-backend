const userModel = require('../models/user.model');
const captainModel = require('../models/captain.model');
const jwt = require('jsonwebtoken');
const blackListTokenSchema = require('../models/blackListToken.model');
const authUser = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({
        message: 'Unauthorized access: No token provided',
      });
    }

    const isBlackListed = await blackListTokenSchema.findOne({token:token})
    if(isBlackListed){
        return res.status(401).json({
            message: 'Unauthorized access: Token is blacklisted',
          });
    }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findById(decoded._id);
    if (!user) {
      return res.status(401).json({
        message: 'Unauthorized access: User not found',
      });
    }
    console.log('User:', user);
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    return res.status(401).json({
      message: 'Unauthorized access: Invalid token',
    });
  }
};

const authCaptain = async (req, res, next) => {
  const token = req.cookies.token ||  req.headers.authorization?.split(' ')[1];
  if (!token) {
    console.log('No token provided');
    return res.status(401).json({
      message: 'Unauthorized access: No token provided',
    });
  }

  const isBlackListed = await blackListTokenSchema.findOne({ token: token });
  if (isBlackListed) {
    return res.status(401).json({
      message: 'Unauthorized access: Token is blacklisted',
    });
  }


  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const captain = await captainModel.findById(decoded._id);
    if (!captain) {
      console.log('Captain not found');
      return res.status(401).json({
        message: 'Unauthorized access: Captain not found',
      });
    }
    req.captain = captain;
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    return res.status(401).json({
      message: 'Unauthorized access: Invalid token',
    });
  }
};

module.exports = { authUser, authCaptain};
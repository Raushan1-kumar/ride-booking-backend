const captainModel = require('../models/captain.model');
const { validationResult } = require('express-validator');
const captainService = require('../services/captain.service');
const blackListTokenSchema = require('../models/blackListToken.model');



module.exports.registerCaptain = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }

  const { fullName, email, password, vehicle } = req.body;
  try {
    const captain = await captainService.createCaptain({
      fullName,
      email,
      password,
      vehicle,
    });

    const token = captain.generateAuthToken();
    res.status(201).json({
      message: 'Captain created successfully',
      captain,
      token,
    });
  } catch (error) {
    next(error);
  }
};

module.exports.loginCaptain = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }

  const { email, password } = req.body;
  try {
    const captain = await captainModel.findOne({ email }).select('+password');
    if (!captain) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    const isMatch = await captain.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    const token = captain.generateAuthToken();
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });
    res.status(200).json({
      message: 'Logged in successfully',
      captain,
      token,
    });
  } catch (error) {
    next(error);
  }
};

module.exports.getCaptainProfile = async (req, res, next) => {

  res.status(200).json({
    captain: req.captain,
    msg:"data sent successfully"
  });
};

module.exports.logoutCaptain = async (req, res, next) => {
  try {
    res.clearCookie('token');
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(400).json({
        message: 'No token provided',
      });
    }
    await blackListTokenSchema.create({ token });

    res.status(200).json({
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};
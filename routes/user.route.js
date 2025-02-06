const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/user.controller');
const { authUser } = require('../middlewares/auth.middleware');
const blackListTokenSchema = require('../models/blackListToken.model');

router.post('/register', [
  body('email').isEmail().withMessage('Invalid Email'),
  body('fullName.firstName').isLength({ min: 3 }).withMessage('firstName should have at least 3 characters'),
  body('password').isLength({ min: 6 }).withMessage('password must be 6 characters long')
], userController.registerUser);

router.post('/login', [
  body('email').isEmail().withMessage('Invalid Email'),
  body('password').isLength({ min: 6 }).withMessage('password must be 6 characters long')
], userController.loginUser);

router.post('/calculate-fare', authUser, userController.calculateFareByVehicle);

router.get('/profile', authUser, userController.getUserProfile);

// router.get('/logout', authUser, userController.logoutUser);
router.get('/logout', authUser, userController.logoutUser);

router.get('/get-lat-lng', authUser, userController.getLatLong);

router.get('/calculate-distance', authUser, userController.calculateDistance);

// router.post('/calculate-fare',authUser, userController.calculateFare);


module.exports = router;

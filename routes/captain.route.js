const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const captainController = require('../controllers/captain.controller');
const { authCaptain } = require('../middlewares/auth.middleware');


router.post('/register', [
  body('email').isEmail().withMessage('Invalid Email'),
  body('fullName.firstName').isLength({ min: 3 }).withMessage('firstName should have at least 3 characters'),
  body('password').isLength({ min: 6 }).withMessage('password must be 6 characters long'),
  body('vehicle.colors').isLength({ min: 3 }).withMessage('colors should have at least 3 characters'),
  body('vehicle.noPlate').isLength({ min: 3 }).withMessage('noPlate must be 3 characters long'),
  body('vehicle.capacity').isLength({ min: 1 }).withMessage('capacity must be 1 characters long'),
  body('vehicle.vehicleType').isIn(['bike', 'car', 'auto']).withMessage('vehicleType must be bike, car or auto')
], captainController.registerCaptain);

router.post('/login', [
  body('email').isEmail().withMessage('Invalid Email'),
  body('password').isLength({ min: 6 }).withMessage('password must be 6 characters long')
], captainController.loginCaptain);

router.get('/profile',authCaptain, captainController.getCaptainProfile);

router.get('/logout', authCaptain, captainController.logoutCaptain);
module.exports = router;
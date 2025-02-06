const express = require('express');
const router = express.Router();
const {body, query} = require('express-validator')
const { authUser } = require('../middlewares/auth.middleware');
const rideController = require('../controllers/ride.controller');
const {validationResult} = require('express-validator');
const { authCaptain } = require('../middlewares/auth.middleware');

router.post('/create',
   body('pickup').isString().isLength({min:3}).withMessage('Invalid Pickup address'),
   body('destination').isString().isLength({min:3}).withMessage('Invalid destination address'),
   body('vehicleType').isString().isLength({min:3}).withMessage('Invalid vehicle Type'),
   authUser, rideController.createRide
)
router.get('/checkOtp',
   query('otp').isString().isLength({ min: 6 }).withMessage('Invalid Otp'),
   (req, res, next) => {
       const errors = validationResult(req);
       if (!errors.isEmpty()) {
           return res.status(400).json({ errors: errors.array() });
       }
       next();
   },
   rideController.checkOtp
);


router.post('/confirm',
    authCaptain,
    body('rideId').isMongoId().withMessage('Invalid ride id'),
    rideController.confirmRide
)

router.get('/start-ride',
    authCaptain,
    query('rideId').isMongoId().withMessage('Invalid ride id'),
    query('otp').isString().isLength({ min: 6, max: 6 }).withMessage('Invalid OTP'),
    rideController.startRide
)

router.post('/end-ride',
    authCaptain,
    body('rideId').isMongoId().withMessage('Invalid ride id'),
    rideController.endRide
)



module.exports= router;
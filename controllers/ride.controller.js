const rideService = require('../services/ride.service');
const {validationResult} = require('express-validator');
const mapService = require('../services/maps.service');
const mapController = require('../controllers/maps.controller');
const {sendMessageToSocketId} = require('../socket');

module.exports.createRide = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }

  const {user, pickup, distance , destination, vehicleType ,fare}=req.body;
  try {
    console.log(req.body);
   const ride = await rideService.createRide({user, pickup , distance, destination, vehicleType,fare});
   res.status(200).json({
    msg:'create',
    ride:ride
   })

   const pickupCoordinates= await mapService.getLatLong(pickup); 
    console.log(pickupCoordinates);
   const captainInRadius = await mapService.getCaptainInTheRadius(pickupCoordinates.lat, pickupCoordinates.lon,50);
   console.log(captainInRadius)

   ride.otp="";

   captainInRadius.map(captain=>{
    sendMessageToSocketId(captain.sockeId,{
      event:'new-ride',
      data:ride,
    })
   })
  } catch (error) {
     console.log(error);
  }
};

module.exports.checkOtp = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }

  const { otp } = req.query;
  try {
    const isValidOtp = await rideService.checkOtp(otp);
    if (isValidOtp) {
      res.status(200).json({
        msg: 'OTP checked',
        isValid: true
      });
    } else {
      res.status(404).json({
        msg: 'Invalid OTP',
        isValid: false
      });
    }
  } catch (error) {
    next(error);
  }
};


module.exports.confirmRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
  }

  const { rideId } = req.body;
  try {
      const ride = await rideService.confirmRide({ rideId, captain: req.captain });

      sendMessageToSocketId(ride.user.socketId, {
          event: 'ride-confirmed',
          data: ride
      })

      return res.status(200).json(ride);
  } catch (err) {

      console.log(err);
      return res.status(500).json({ message: err.message });
  }
}


module.exports.startRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
  }

  const { rideId, otp } = req.query;

  try {
      const ride = await rideService.startRide({ rideId, otp, captain: req.captain });

      console.log(ride);

      sendMessageToSocketId(ride.user.socketId, {
          event: 'ride-started',
          data: ride
      })

      return res.status(200).json(ride);
  } catch (err) {
      return res.status(500).json({ message: err.message });
  }
}

module.exports.endRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
  }

  const { rideId } = req.body;

  try {
      const ride = await rideService.endRide({ rideId, captain: req.captain });

      sendMessageToSocketId(ride.user.socketId, {
          event: 'ride-ended',
          data: ride
      })



      return res.status(200).json(ride);
  } catch (err) {
      return res.status(500).json({ message: err.message });
  } 
}
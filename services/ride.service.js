const rideModel = require('../models/ride.model');
const mapController = require('../controllers/maps.controller');
const crypto=require('crypto');
const {validationResult} = require('express-validator')


function generateOtpUsingMath() {
    const otp= Math.floor(100000 + Math.random() * 900000).toString();
    return otp;
}
module.exports.createRide = async ({ user, captain, pickup ,distance, destination, vehicleType,fare  }) => {
    if (!pickup || !destination || !vehicleType||!fare) {
        throw new Error('User, pickup, destination, and vehicleType are required');
    }
    const ride = new rideModel({
        user,
        captain,
        pickup,
        distance,
        destination,
        status: 'pending',
        fare,
        otp:generateOtpUsingMath()
    });

    await ride.save();
    return ride;
};

module.exports.checkOtp = async (otp) => {
  try {
    const ride = await rideModel.findOne({ otp: otp });
    return !!ride; // Return true if ride is found, otherwise false
  } catch (error) {
    throw new Error('Error checking OTP');
  }
};


module.exports.confirmRide = async ({
    rideId, captain
}) => {
    if (!rideId) {
        throw new Error('Ride id is required');
    }

    await rideModel.findOneAndUpdate({
        _id: rideId
    }, {
        status: 'ongoing',
        captain: captain._id
    })

    const ride = await rideModel.findOne({
        _id: rideId
    }).populate('user').populate('captain').select('+otp');

    if (!ride) {
        throw new Error('Ride not found');
    }

    return ride;

}



module.exports.startRide = async ({ rideId, otp, captain }) => {
  if (!rideId || !otp) {
      throw new Error('Ride id and OTP are required');
  }

  const ride = await rideModel.findOne({
      _id: rideId
  }).populate('user').populate('captain').select('+otp');

  if (!ride) {
      throw new Error('Ride not found');
  }

  if (ride.status !== 'accepted') {
      throw new Error('Ride not accepted');
  }

  if (ride.otp !== otp) {
      throw new Error('Invalid OTP');
  }

  await rideModel.findOneAndUpdate({
      _id: rideId
  }, {
      status: 'ongoing'
  })

  return ride;
}


module.exports.endRide = async ({ rideId, captain }) => {
  if (!rideId) {
      throw new Error('Ride id is required');
  }

  const ride = await rideModel.findOne({
      _id: rideId,
      captain: captain._id
  }).populate('user').populate('captain').select('+otp');

  if (!ride) {
      throw new Error('Ride not found');
  }

  if (ride.status !== 'ongoing') {
      throw new Error('Ride not ongoing');
  }

  await rideModel.findOneAndUpdate({
      _id: rideId
  }, {
      status: 'completed'
  })

  return ride;
}
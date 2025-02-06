const captainModel = require('../models/captain.model');

module.exports.createCaptain = async ({ fullName, email, password, vehicle }) => {
  if (!fullName || !email || !password || !vehicle) {
    throw new Error('All fields are required');
  }

  const captain = new captainModel({
    fullName: {
      firstName: fullName.firstName,
      lastName: fullName.lastName,
    },
    email,
    password,
    vehicle: {
      colors: vehicle.colors,
      noPlate: vehicle.noPlate,
      capacity: vehicle.capacity,
      vehicleType: vehicle.vehicleType,
    }
  });

  await captain.save();
  return captain;
};



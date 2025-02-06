const blackListTokenSchema = require('../models/blackListToken.model');
const userModel = require('../models/user.model');
const userService =  require('../services/user.service');
const { validationResult } = require('express-validator');
const axios = require('axios'); // Import axios for API requests

module.exports.registerUser = async (req, res, next) => {
     const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }

  const {fullName, email, password}= req.body;
  const user = await userService.createUser({
    firstName:fullName.firstName,
    lastName: fullName.lastName,
     email,
     password
    });
  
    const token = user.generateAuthToken();
    res.status(201).json({
      message: 'User created successfully',
      user,
      token,
    });
};

module.exports.loginUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }
  const { email, password } = req.body;
  const user = await userModel.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({
      message: 'Invalid email or password',
    });
  }
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({
      message: 'Invalid email or password',
    });
  }
  const token = user.generateAuthToken();
  res.cookie('token', token);
  res.status(200).json({
    message: 'Logged in successfully',
    user,
    token,
  });
};

module.exports.getUserProfile = async (req, res, next) => {
  res.status(200).json({
    user: req.user,
  });
};

module.exports.logoutUser = async (req, res, next) => {
  try {
    res.clearCookie('token');
    const token = req.cookies.token || req.headers.authorization.split(' ')[1];
    await blackListTokenSchema.create({ token });
    res.status(200).json({
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};


module.exports.getLatLong = async (req, res, next) => {
  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({
        message: 'Address is required',
      });
    }

    // Use OpenStreetMap Nominatim API (Free)
    const url = `https://nominatim.openstreetmap.org/search`;
    const params = {
      q: address,
      format: 'json',
      limit: 1, // Fetch only one result
    };

    const response = await axios.get(url, { params });

    if (response.data.length === 0) {
      return res.status(404).json({
        message: 'Address not found',
      });
    }

    const { lat, lon } = response.data[0]; // Extract latitude and longitude
    res.status(200).json({
      message: 'Location fetched successfully',
      address,
      latitude: lat,
      longitude: lon,
    });
  } catch (error) {
    next(error); // Pass errors to the error handler middleware
  }
};


// calculating distance between two address
const toRadians = (degrees) => (degrees * Math.PI) / 180;

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
};

module.exports.calculateDistance = async (req, res, next) => {
  try {
    const { pickupAddress, destinationAddress } = req.body;

    if (!pickupAddress || !destinationAddress) {
      return res.status(400).json({
        message: 'Both pickup and destination addresses are required',
      });
    }

    // Geocode both addresses using OpenStreetMap Nominatim API
    const geocodeUrl = `https://nominatim.openstreetmap.org/search`;
    
    // Fetch pickup coordinates
    const pickupResponse = await axios.get(geocodeUrl, {
      params: { q: pickupAddress, format: 'json', limit: 1 },
    });

    if (pickupResponse.data.length === 0) {
      return res.status(404).json({
        message: 'Pickup address not found',
      });
    }

    const pickupCoords = pickupResponse.data[0];
    const pickupLat = parseFloat(pickupCoords.lat);
    const pickupLon = parseFloat(pickupCoords.lon);

    // Fetch destination coordinates
    const destinationResponse = await axios.get(geocodeUrl, {
      params: { q: destinationAddress, format: 'json', limit: 1 },
    });

    if (destinationResponse.data.length === 0) {
      return res.status(404).json({
        message: 'Destination address not found',
      });
    }

    const destinationCoords = destinationResponse.data[0];
    const destinationLat = parseFloat(destinationCoords.lat);
    const destinationLon = parseFloat(destinationCoords.lon);

    // Calculate distance using Haversine formula
    const distance = haversineDistance(
      pickupLat,
      pickupLon,
      destinationLat,
      destinationLon
    );

    res.status(200).json({
      message: 'Distance calculated successfully',
      pickupAddress,
      destinationAddress,
      distance: distance.toFixed(2) + ' km', // Distance in kilometers
    });
  } catch (error) {
    next(error); // Pass errors to the error handler middleware
  }
};


module.exports.calculateFareByVehicle = async (req, res, next) => {
  try {
    const { distance, vehicleType } = req.body;

    if (!distance || !vehicleType) {
      return res.status(400).json({
        message: 'Distance and vehicle type are required to calculate fare',
      });
    }

    // Parse and validate distance
    const parsedDistance = parseFloat(distance);
    if (isNaN(parsedDistance)) {
      return res.status(400).json({
        message: 'Invalid distance format',
      });
    }

    // Vehicle fare configuration
    const vehicleFareConfig = {
      bike: {
        baseFare: 5, // Base fare for a bike
        costPerKm: 10, // Cost per km for a bike
        maxPassengers: 1,
      },
      auto: {
        baseFare: 10, // Base fare for an auto
        costPerKm: 13, // Cost per km for an auto
        maxPassengers: 3,
      },
      car: {
        baseFare: 15, // Base fare for a car
        costPerKm: 22, // Cost per km for a car
        maxPassengers: 4,
      },
    };

    // Check if the provided vehicle type is valid
    if (!vehicleFareConfig[vehicleType]) {
      return res.status(400).json({
        message: 'Invalid vehicle type. Please choose from bike, auto, or car.',
      });
    }

    // Calculate fare based on the selected vehicle type
    const { baseFare, costPerKm, maxPassengers } = vehicleFareConfig[vehicleType];
    const totalFare = baseFare + parsedDistance * costPerKm;

    res.status(200).json({
      message: 'Fare calculated successfully',
      vehicleType,
      maxPassengers,
      distance: parsedDistance.toFixed(2) + ' km',
      fare: totalFare.toFixed(2), // Total fare rounded to two decimal places
    });
  } catch (error) {
    next(error); // Pass errors to the error handler middleware
  }
};

const { default: axios } = require("axios");
const captainModel = require('../models/captain.model')
const mapsService = require('../services/maps.service');

module.exports.getLatLong = async (req, res, next) => {
  try {
    const { address } = req.query;

    if (!address) {
      return res.status(400).json({
        message: 'Address is required',
      });
    }

    const { lat, lon } = await mapsService.getLatLong(address);

    res.status(200).json({
      lat,
      lon,
    });
  } catch (error) {
    next(error);
  }
};


  
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
    const { pickupAddress, destinationAddress } = req.query;
    const duration=0;
    console.log("executed");

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
      distance: distance.toFixed(2) + ' km',// Distance in kilometers
      duration: 4 *distance.toFixed(2)+ ' min',
    });
  } catch (error) {
    // next(error); // Pass errors to the error handler middleware
  }
};



module.exports.addressSuggestion = async (req, res, next) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        message: 'Query is required for address suggestions',
      });
    }

    // LocationIQ API URL
    const url = `https://us1.locationiq.com/v1/search.php`;

    // Replace with your LocationIQ API token
    const apiToken = 'pk.9d44da228ca56d61c53d113fdb6973bd'; // Example token

    // Fetch suggestions from LocationIQ API
    const response = await axios.get(url, {
      params: {
        key: apiToken,          // Use API token here
        q: query,              // The search query
        format: 'json',         // Response format
        addressdetails: 1,      // Include detailed address components
        limit: 5,               // Limit the number of suggestions
      },
    });

    // Map results to a simpler structure
    const suggestions = response.data.map((item) => ({
      display_name: item.display_name,
      lat: item.lat,
      lon: item.lon,
    }));

    res.status(200).json({
      message: 'Suggestions fetched successfully',
      suggestions,
    });
  } catch (error) {
    next(error);
  }
};



module.exports.getFare = async (req, res, next) => {
        try {
          const { distance } = req.query;
      
          if (!distance) {
            return res.status(400).json({
              message: 'Distance is required to calculate fare',
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
      
          // Calculate fare for each vehicle type
          const fareDetails = Object.entries(vehicleFareConfig).map(
            ([vehicleType, { baseFare, costPerKm, maxPassengers }]) => ({
              vehicleType,
              maxPassengers,
              distance: `${parsedDistance.toFixed(2)} km`,
              fare: (baseFare + parsedDistance * costPerKm).toFixed(2), // Total fare rounded to two decimal places
            })
          );
      
          res.status(200).json({
            message: 'Fare calculated successfully for all vehicle types',
            distance: `${parsedDistance.toFixed(2)} km`,
            fares: fareDetails, // Array of fare details for each vehicle
          });
        } catch (error) {
          next(error); // Pass errors to the error handler middleware
        }
};
      

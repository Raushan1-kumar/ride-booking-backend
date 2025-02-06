const express = require('express');
const router = express.Router();
const { authUser } = require('../middlewares/auth.middleware');
const mapController = require('../controllers/maps.controller');

router.get('/get-coordinates', authUser, mapController.getLatLong)
router.get('/get-distance', authUser, mapController.calculateDistance)
router.get('/get-suggestion', mapController.addressSuggestion)
router.get('/get-fare', mapController.getFare);

module.exports= router;

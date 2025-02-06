const { selectFields } = require('express-validator/lib/field-selection');
const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    captain: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Captain'
    },
    pickup: {
        type: String,
        required: true
    },
    destination: {
        type: String,
        required: true
    },
    fare: {
        type: Number,
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'accepted','ongoing','cancelled'],
        default: 'pending'
    },
    duration: {
        type: Number,
    },
    distance: {
        type: String,
    },
    paymentId: {
        type: String,
    },
    orderId: {
        type: String,
    },
    signature: {
        type: String,
    },
    otp:{
        type: String,
        select:false,
        required:true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 20000 
    }
});


module.exports = mongoose.model('Ride', rideSchema);
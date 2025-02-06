const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { LCPThresholds } = require('web-vitals');

const captainSchema = new mongoose.Schema({
  fullName: {
    firstName: {
      type: String,
      required: true,
      minLength: [3, 'First name should have at least 3 characters'],
    },
    lastName: {
      type: String,
      minLength: [3, 'Last name should have at least 3 characters'],
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    minLength: [5, 'Email must be at least 5 characters long'],
    match: [/\S+@\S+\.\S+/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: true,
    minLength: [6, 'Password must be at least 6 characters long'],
    select: false, // Exclude password by default
  },
  sockeId: {
    type: String,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'inactive',
  },
  vehicle: {
    colors: {
      type: String,
      required: true,
      minLength: [3, 'Color must be at least 3 characters long'],
    },
    noPlate: {
      type: String,
      required: true,
      minLength: [3, 'Plate number must be at least 3 characters long'],
    },
    capacity: {
      type: Number,
      required: true,
      minLength: [1, 'Capacity must be at least 1 characters long'],
    },
    vehicleType: {
      type: String,
      required: true,
      enum: ['bike', 'car', 'auto'],
    },
  },
  location: {
    ltd: {
      type: Number,
    },
    lng: {
      type: Number,
    },
  },
});

captainSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Compare password
captainSchema.methods.comparePassword = async function (password) {
  const isMatch = await bcrypt.compare(password, this.password);
  return isMatch;
};

// Generate JWT token
captainSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
  return token;
};

const captainModel = mongoose.model('Captain', captainSchema);

module.exports = captainModel;
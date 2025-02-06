const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
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
  },
  password: {
    type: String,
    required: true,
    minLength: [6, 'Password must be at least 6 characters long'],
    select: false, // Exclude password by default
  },
  socketId:{
    type:String
  }
});

// Hash the password before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (password) {
  const isMatch = await bcrypt.compare(password, this.password);
  return isMatch;
};

// Generate JWT token
userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
  return token;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
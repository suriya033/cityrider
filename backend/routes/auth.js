const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'secret123',
    { expiresIn: '7d' }
  );
};

// ✅ Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({
        message: 'Name is required',
        details: 'Please provide your full name'
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        message: 'Email is required',
        details: 'Please provide your email address'
      });
    }

    if (!password) {
      return res.status(400).json({
        message: 'Password is required',
        details: 'Please provide a password'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        message: 'Invalid email format',
        details: 'Please provide a valid email address'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password too short',
        details: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists (Email or Aadhar)
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { aadharNumber: req.body.aadharNumber }
      ]
    });

    if (existingUser) {
      if (existingUser.email === normalizedEmail) {
        return res.status(400).json({
          message: 'User already exists',
          details: 'An account with this email already exists. Please login instead.'
        });
      }
      if (existingUser.aadharNumber === req.body.aadharNumber) {
        return res.status(400).json({
          message: 'Aadhar number already registered',
          details: 'An account with this Aadhar number already exists.'
        });
      }
    }

    // Prepare user data - default role is 'passenger'
    const userData = {
      name: name.trim(),
      email: normalizedEmail,
      password: password,
      role: 'passenger', // Default role
      uniqueId: 'CR-' + Math.floor(100000 + Math.random() * 900000), // Generate CR-XXXXXX
      dateOfBirth: req.body.dateOfBirth,
      mobileNumber: req.body.mobileNumber,
      aadharNumber: req.body.aadharNumber,
      city: req.body.city,
      gender: req.body.gender,
      profilePicture: req.body.profilePicture,
      canSwitchRole: req.body.canSwitchRole
    };

    // Create and save user
    const user = new User(userData);
    await user.save();

    // Generate token
    const token = generateToken(user);

    // Return user data without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: userResponse
    });
  } catch (err) {
    console.error('Registration error:', err);

    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
        message: 'Validation error',
        details: validationErrors.join(', '),
        errors: validationErrors
      });
    }

    // Handle duplicate key error (MongoDB unique constraint)
    // Handle duplicate key error (MongoDB unique constraint)
    if (err.code === 11000) {
      if (err.keyPattern && err.keyPattern.aadharNumber) {
        return res.status(400).json({
          message: 'Aadhar number already registered',
          details: 'An account with this Aadhar number already exists.'
        });
      }
      return res.status(400).json({
        message: 'User already exists',
        details: 'An account with this email already exists. Please login instead.'
      });
    }

    // Handle MongoDB connection errors
    if (err.name === 'MongoServerError' || err.name === 'MongooseError') {
      return res.status(503).json({
        message: 'Database error',
        details: 'Unable to connect to database. Please try again later.'
      });
    }

    // Generic server error
    res.status(500).json({
      message: 'Server error during registration',
      details: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred. Please try again.'
    });
  }
});

// ✅ Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email/ID and password are required',
        details: 'Please provide your email or User ID and password to login'
      });
    }

    // ✅ Find user by email (case-insensitive) OR uniqueId
    const identifier = email.trim();
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { uniqueId: identifier }
      ]
    });

    if (!user) {
      return res.status(400).json({
        message: 'Invalid credentials',
        details: 'Email/ID or password is incorrect'
      });
    }

    // ✅ Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        message: 'Invalid credentials',
        details: 'Email or password is incorrect'
      });
    }

    // ✅ Generate token
    const token = generateToken(user);

    // ✅ Return user data without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      message: 'Login successful',
      token,
      user: userResponse
    });
  } catch (err) {
    console.error('❌ Login error:', err);

    // ✅ Handle MongoDB connection errors
    if (err.name === 'MongoServerError' || err.name === 'MongooseError') {
      return res.status(503).json({
        message: 'Database error',
        details: 'Unable to connect to database. Please try again later.'
      });
    }

    // ✅ Generic server error
    res.status(500).json({
      message: 'Server error during login',
      details: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred. Please try again.'
    });
  }
});

// ✅ Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    console.error('❌ Get current user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

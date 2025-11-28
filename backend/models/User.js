const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  uniqueId: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['driver', 'passenger', 'admin'],
    required: true,
  },
  dateOfBirth: {
    type: Date,
  },
  mobileNumber: {
    type: String,
    trim: true,
  },
  aadharNumber: {
    type: String,
    trim: true,
    unique: true,
    sparse: true, // Allows null/empty values to be unique if needed, but here we likely want it to be unique if present
  },
  city: {
    type: String,
    trim: true,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', ''],
    default: '',
  },
  canSwitchRole: {
    type: Boolean,
    default: true,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalRatings: {
    type: Number,
    default: 0,
  },
  contactInfo: {
    phone: {
      type: String,
      default: '',
    },
    alternatePhone: {
      type: String,
      default: '',
    },
  },
  profilePicture: {
    type: String,
    default: '',
  },
  vehicleInfo: {
    type: String,
    default: '', // optional during registration, drivers can fill later
  },
  licenseNumber: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

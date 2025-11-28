const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  rideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride',
    required: true
  },
  passengerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seatsBooked: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ['pending', 'registered', 'accepted', 'confirmed', 'canceled', 'completed', 'payment_processing'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    default: 'Online'
  },
  totalAmount: {
    type: Number,
    required: true
  },
  // OTP Verification
  verificationCode: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedAt: {
    type: Date
  },
  pickUpLocation: {
    address: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  // Passenger Details
  passengerDetails: {
    contactNumber: {
      type: String,
      trim: true
    },
    emergencyContact: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
      relation: { type: String, trim: true }
    },
    numberOfAdults: {
      type: Number,
      default: 1,
      min: 0
    },
    numberOfChildren: {
      type: Number,
      default: 0,
      min: 0
    },
    specialRequirements: {
      type: String,
      trim: true,
      default: ''
    },
    luggage: {
      type: String,
      enum: ['none', 'small', 'medium', 'large'],
      default: 'none'
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);








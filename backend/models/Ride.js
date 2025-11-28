const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  origin: {
    address: {
      type: String,
      required: true
    },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  destination: {
    address: {
      type: String,
      required: true
    },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  departureTime: {
    type: Date,
    required: true
  },
  seatsAvailable: {
    type: Number,
    required: true,
    min: 1
  },
  bookedSeats: {
    type: Number,
    default: 0,
    min: 0
  },
  vehicleType: {
    type: String,
    enum: ['Car', 'Bike', 'Bus', 'Van', 'SUV','Auto', 'Other'],
    default: 'Car'
  },
  pricePerSeat: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'canceled'],
    default: 'active'
  },
  route: {
    distance: { type: Number },
    duration: { type: Number },
    polyline: { type: String }
  }
}, {
  timestamps: true
});

// Virtual to check available seats
rideSchema.virtual('availableSeats').get(function() {
  return this.seatsAvailable - this.bookedSeats;
});

rideSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Ride', rideSchema);








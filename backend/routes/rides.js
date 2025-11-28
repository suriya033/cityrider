const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Ride = require('../models/Ride');
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/rides
// @desc    Create a new ride
// @access  Private (Driver only)
router.post('/', [
  auth,
  body('origin.address').notEmpty().withMessage('Origin address is required'),
  body('destination.address').notEmpty().withMessage('Destination address is required'),
  body('departureTime').isISO8601().withMessage('Valid departure time is required'),
  body('seatsAvailable').isInt({ min: 1 }).withMessage('At least 1 seat must be available'),
  body('pricePerSeat').isFloat({ min: 0 }).withMessage('Price per seat must be a positive number')
], async (req, res) => {
  try {
    if (req.user.role !== 'driver') {
      return res.status(403).json({ message: 'Only drivers can post rides' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const rideData = {
      ...req.body,
      driverId: req.user._id
    };

    const ride = new Ride(rideData);
    await ride.save();

    const populatedRide = await Ride.findById(ride._id)
      .populate('driverId', 'name email rating profilePicture vehicleInfo');

    res.status(201).json(populatedRide);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/rides
// @desc    Get all rides with filters
// @access  Public
router.get('/', [
  query('origin').optional(),
  query('destination').optional(),
  query('date').optional(),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('seatsAvailable').optional().isInt({ min: 1 }),
  query('vehicleType').optional()
], async (req, res) => {
  try {
    const {
      origin,
      destination,
      date,
      minPrice,
      maxPrice,
      seatsAvailable,
      vehicleType
    } = req.query;

    let filter = { status: 'active' };

    if (origin) {
      filter['origin.address'] = { $regex: origin, $options: 'i' };
    }

    if (destination) {
      filter['destination.address'] = { $regex: destination, $options: 'i' };
    }

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      filter.departureTime = { $gte: startDate, $lte: endDate };
    }

    if (minPrice || maxPrice) {
      filter.pricePerSeat = {};
      if (minPrice) filter.pricePerSeat.$gte = parseFloat(minPrice);
      if (maxPrice) filter.pricePerSeat.$lte = parseFloat(maxPrice);
    }

    if (seatsAvailable) {
      filter.$expr = {
        $gte: [
          { $subtract: ['$seatsAvailable', '$bookedSeats'] },
          parseInt(seatsAvailable)
        ]
      };
    }

    if (vehicleType) {
      filter.vehicleType = vehicleType;
    }

    const rides = await Ride.find(filter)
      .populate('driverId', 'name email rating profilePicture vehicleInfo dateOfBirth city uniqueId')
      .sort({ departureTime: 1 });

    res.json(rides);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/rides/driver/my-rides
// @desc    Get all rides posted by current driver
// @access  Private (Driver only)
router.get('/driver/my-rides', auth, async (req, res) => {
  try {
    if (req.user.role !== 'driver') {
      return res.status(403).json({ message: 'Only drivers can access this' });
    }

    const rides = await Ride.find({ driverId: req.user._id })
      .populate('driverId', 'name email rating')
      .sort({ createdAt: -1 });

    res.json(rides);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/rides/admin/all
// @desc    Get all rides (Admin only)
// @access  Private/Admin
router.get('/admin/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const rides = await Ride.find()
      .populate('driverId', 'name email')
      .sort({ createdAt: -1 });
    res.json(rides);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/rides/:id
// @desc    Get a specific ride
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate('driverId', 'name email rating profilePicture vehicleInfo contactInfo dateOfBirth city uniqueId');

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    res.json(ride);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/rides/:id
// @desc    Update a ride
// @access  Private (Driver only, owner)
router.put('/:id', auth, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.driverId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this ride' });
    }

    // Don't allow updating if there are confirmed bookings
    const confirmedBookings = await Booking.countDocuments({
      rideId: ride._id,
      status: 'confirmed'
    });

    if (confirmedBookings > 0) {
      return res.status(400).json({ message: 'Cannot update ride with confirmed bookings' });
    }

    Object.assign(ride, req.body);
    await ride.save();

    const updatedRide = await Ride.findById(ride._id)
      .populate('driverId', 'name email rating profilePicture vehicleInfo');

    res.json(updatedRide);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/rides/:id
// @desc    Cancel a ride
// @access  Private (Driver only, owner)
router.delete('/:id', auth, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.driverId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this ride' });
    }

    ride.status = 'canceled';
    await ride.save();

    // Cancel all bookings for this ride
    await Booking.updateMany(
      { rideId: ride._id, status: 'confirmed' },
      { status: 'canceled' }
    );

    res.json({ message: 'Ride canceled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/rides/:id/complete
// @desc    Mark a ride as completed (only after all bookings are finalized)
// @access  Private (Driver only, owner)
router.put('/:id/complete', auth, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.driverId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to complete this ride' });
    }

    if (ride.status === 'completed') {
      return res.status(400).json({ message: 'Ride is already completed' });
    }

    // Check if there are any bookings for this ride
    const allBookings = await Booking.find({ rideId: ride._id });

    if (allBookings.length === 0) {
      // No bookings, can complete the ride
      ride.status = 'completed';
      await ride.save();
      return res.json({ message: 'Ride marked as completed successfully', ride });
    }

    // Check if all bookings are either completed or canceled
    const hasActiveBookings = allBookings.some(booking =>
      booking.status !== 'completed' && booking.status !== 'canceled'
    );

    if (hasActiveBookings) {
      return res.status(400).json({
        message: 'Cannot complete ride. Some bookings are still active. All passengers must complete their rides first.',
        details: 'Please ensure all passengers have completed their payment and the ride is finished.'
      });
    }

    // All bookings are completed/canceled, safe to complete the ride
    ride.status = 'completed';
    await ride.save();

    res.json({ message: 'Ride marked as completed successfully', ride });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/rides/:id/bookings
// @desc    Get all bookings for a ride
// @access  Private (Driver only, owner)
router.get('/:id/bookings', auth, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.driverId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const bookings = await Booking.find({ rideId: ride._id })
      .populate('passengerId', 'name email rating profilePicture')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


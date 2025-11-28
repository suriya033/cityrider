const express = require('express');
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Ride = require('../models/Ride');
const auth = require('../middleware/auth');

const router = express.Router();

// Helper function to generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @route   POST /api/bookings
// @desc    Register a new booking (creates booking with OTP)
// @access  Private (Passenger only)
router.post('/', [
  auth,
  body('rideId').notEmpty().withMessage('Ride ID is required'),
  body('seatsBooked').isInt({ min: 1 }).withMessage('At least 1 seat must be booked')
], async (req, res) => {
  try {
    if (req.user.role !== 'passenger') {
      return res.status(403).json({ message: 'Only passengers can book rides' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rideId, seatsBooked, pickUpLocation, passengerDetails } = req.body;

    // Check if ride exists and is active
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.status !== 'active') {
      return res.status(400).json({ message: 'Ride is not available for booking' });
    }

    // Check if driver is booking their own ride
    if (ride.driverId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot book your own ride' });
    }

    // Check available seats
    const availableSeats = ride.seatsAvailable - ride.bookedSeats;
    if (seatsBooked > availableSeats) {
      return res.status(400).json({
        message: `Only ${availableSeats} seat(s) available`
      });
    }

    // Check if user already has a booking for this ride
    const existingBooking = await Booking.findOne({
      rideId,
      passengerId: req.user._id,
      status: { $in: ['pending', 'registered', 'accepted', 'confirmed'] }
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'You already have a booking for this ride' });
    }

    // Generate OTP for verification
    const verificationCode = generateOTP();

    // Create booking with 'registered' status
    const totalAmount = seatsBooked * ride.pricePerSeat;
    const booking = new Booking({
      rideId,
      passengerId: req.user._id,
      seatsBooked,
      totalAmount,
      pickUpLocation: pickUpLocation || null,
      passengerDetails: passengerDetails || {},
      verificationCode,
      status: 'registered'
    });

    await booking.save();

    // Update ride booked seats
    ride.bookedSeats += seatsBooked;
    await ride.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('rideId')
      .populate('passengerId', 'name email rating profilePicture');

    res.status(201).json(populatedBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


// @route   GET /api/bookings
// @desc    Get all bookings (Admin only)
// @access  Private/Admin
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const bookings = await Booking.find()
      .populate('rideId')
      .populate('passengerId', 'name email')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/bookings/my-bookings
// @desc    Get all bookings for current user
// @access  Private
router.get('/my-bookings', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ passengerId: req.user._id })
      .populate({
        path: 'rideId',
        populate: {
          path: 'driverId',
          select: 'name email rating profilePicture vehicleInfo uniqueId'
        }
      })
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/bookings/:id
// @desc    Get a specific booking
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: 'rideId',
        populate: {
          path: 'driverId',
          select: 'name email rating profilePicture vehicleInfo contactInfo uniqueId'
        }
      })
      .populate('passengerId', 'name email rating profilePicture');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is authorized (owner or driver of the ride)
    const isPassenger = booking.passengerId && booking.passengerId._id && booking.passengerId._id.toString() === req.user._id.toString();
    const isDriver = booking.rideId && booking.rideId.driverId && booking.rideId.driverId._id && booking.rideId.driverId._id.toString() === req.user._id.toString();
    if (!isPassenger && !isDriver) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/bookings/:id/accept
// @desc    Accept a registered booking (Driver action)
// @access  Private (Driver only)
router.put('/:id/accept', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('rideId');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (!booking.rideId) {
      return res.status(400).json({ message: 'Ride information not found' });
    }

    // Check if the current user is the driver of the ride
    if (!booking.rideId.driverId) {
      return res.status(400).json({ message: 'Driver information not found' });
    }

    const driverId = booking.rideId.driverId._id
      ? booking.rideId.driverId._id.toString()
      : booking.rideId.driverId.toString();

    if (driverId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (booking.status !== 'registered') {
      return res.status(400).json({ message: 'Booking must be in registered status to accept' });
    }

    booking.status = 'accepted';
    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate('rideId')
      .populate('passengerId', 'name email rating profilePicture');

    res.json(updatedBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/bookings/:id/verify
// @desc    Verify booking with OTP (Driver enters passenger's OTP to confirm ride)
// @access  Private (Driver only)
router.put('/:id/verify', [
  auth,
  body('verificationCode').notEmpty().withMessage('Verification code is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const booking = await Booking.findById(req.params.id).populate('rideId');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (!booking.rideId) {
      return res.status(400).json({ message: 'Ride information not found' });
    }

    // Check if the current user is the driver of the ride
    if (!booking.rideId.driverId) {
      return res.status(400).json({ message: 'Driver information not found' });
    }

    const driverId = booking.rideId.driverId._id
      ? booking.rideId.driverId._id.toString()
      : booking.rideId.driverId.toString();

    if (driverId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (booking.status !== 'accepted') {
      return res.status(400).json({ message: 'Booking must be accepted before verification' });
    }

    // Verify OTP
    const { verificationCode } = req.body;
    if (booking.verificationCode !== verificationCode) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    // Mark as verified and confirmed
    booking.isVerified = true;
    booking.verifiedAt = new Date();
    booking.status = 'confirmed';
    booking.paymentStatus = 'paid';
    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate('rideId')
      .populate('passengerId', 'name email rating profilePicture');

    res.json(updatedBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/bookings/:id/complete
// @desc    Initiate booking completion (Passenger selects payment)
// @access  Private (Passenger only)
router.put('/:id/complete', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('rideId');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if the current user is the passenger
    if (booking.passengerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({ message: 'Booking must be confirmed to complete' });
    }

    const { paymentMethod } = req.body;

    booking.status = 'payment_processing';
    // Store payment method in a way that doesn't require schema changes if possible, 
    // or assume schema has it. If not, maybe put in passengerDetails?
    // Let's try adding it directly, assuming schema is flexible or updated.
    // If not, we can use a temporary field or notes.
    if (paymentMethod) {
      booking.paymentMethod = paymentMethod;
      // Also save in passengerDetails as a fallback
      if (!booking.passengerDetails) booking.passengerDetails = {};
      booking.passengerDetails.paymentMethod = paymentMethod;
      booking.markModified('passengerDetails');
    }

    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate('rideId')
      .populate('passengerId', 'name email rating profilePicture');

    res.json(updatedBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/bookings/:id/finalize
// @desc    Finalize booking (Driver confirms payment/completion)
// @access  Private (Driver only)
router.put('/:id/finalize', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('rideId');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (!booking.rideId) {
      return res.status(400).json({ message: 'Ride information not found' });
    }

    // Check if the current user is the driver of the ride
    const driverId = booking.rideId.driverId._id
      ? booking.rideId.driverId._id.toString()
      : booking.rideId.driverId.toString();

    if (driverId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (booking.status !== 'payment_processing') {
      return res.status(400).json({ message: 'Booking is not waiting for confirmation' });
    }

    booking.status = 'completed';
    booking.paymentStatus = 'paid'; // Ensure it's marked as paid
    booking.completedAt = new Date(); // Track completion time
    await booking.save();

    // Check if all bookings for this ride are completed
    const allBookings = await Booking.find({ rideId: booking.rideId._id });
    const allCompleted = allBookings.every(b =>
      b.status === 'completed' || b.status === 'canceled'
    );

    // If all bookings are completed/canceled, mark the ride as completed
    if (allCompleted && allBookings.length > 0) {
      const ride = await Ride.findById(booking.rideId._id);
      if (ride && ride.status !== 'completed') {
        ride.status = 'completed';
        await ride.save();
      }
    }

    const updatedBooking = await Booking.findById(booking._id)
      .populate('rideId')
      .populate('passengerId', 'name email rating profilePicture');

    res.json(updatedBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/bookings/:id/cancel
// @desc    Cancel a booking
// @access  Private
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('rideId');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (!booking.rideId) {
      return res.status(400).json({ message: 'Ride information not found' });
    }

    // Check authorization
    const isPassenger = booking.passengerId && booking.passengerId.toString() === req.user._id.toString();
    const isDriver = booking.rideId.driverId && booking.rideId.driverId.toString() === req.user._id.toString();

    if (!isPassenger && !isDriver) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // If confirmed booking is canceled, free up seats
    if (booking.status === 'confirmed') {
      const ride = await Ride.findById(booking.rideId._id);
      ride.bookedSeats = Math.max(0, ride.bookedSeats - booking.seatsBooked);
      await ride.save();
    }

    booking.status = 'canceled';
    await booking.save();

    res.json({ message: 'Booking canceled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


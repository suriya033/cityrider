const express = require('express');
const { body, validationResult } = require('express-validator');
const Message = require('../models/Message');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/messages
// @desc    Send a message
// @access  Private
router.post('/', [
  auth,
  body('receiverId').notEmpty().withMessage('Receiver ID is required'),
  body('message').notEmpty().trim().withMessage('Message is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { receiverId, message, rideId } = req.body;

    const newMessage = new Message({
      senderId: req.user._id,
      receiverId,
      message,
      rideId: rideId || null
    });

    await newMessage.save();

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('senderId', 'name profilePicture')
      .populate('receiverId', 'name profilePicture');

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/messages/conversation/:userId
// @desc    Get conversation with a user
// @access  Private
router.get('/conversation/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { rideId } = req.query;

    let filter = {
      $or: [
        { senderId: req.user._id, receiverId: userId },
        { senderId: userId, receiverId: req.user._id }
      ]
    };

    if (rideId) {
      filter.rideId = rideId;
    }

    const messages = await Message.find(filter)
      .populate('senderId', 'name profilePicture')
      .populate('receiverId', 'name profilePicture')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/messages/conversations
// @desc    Get all conversations for current user
// @access  Private
router.get('/conversations', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { senderId: req.user._id },
        { receiverId: req.user._id }
      ]
    })
      .populate('senderId', 'name profilePicture')
      .populate('receiverId', 'name profilePicture')
      .sort({ createdAt: -1 });

    // Group by conversation partner
    const conversations = {};
    messages.forEach(msg => {
      const partnerId = msg.senderId._id.toString() === req.user._id.toString()
        ? msg.receiverId._id.toString()
        : msg.senderId._id.toString();

      if (!conversations[partnerId]) {
        conversations[partnerId] = {
          user: msg.senderId._id.toString() === req.user._id.toString()
            ? msg.receiverId
            : msg.senderId,
          lastMessage: msg,
          unreadCount: 0
        };
      }

      if (msg.receiverId._id.toString() === req.user._id.toString() && !msg.read) {
        conversations[partnerId].unreadCount++;
      }
    });

    res.json(Object.values(conversations));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/messages/conversation/:userId/read
// @desc    Mark all messages in conversation as read
// @access  Private
router.put('/conversation/:userId/read', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { rideId } = req.body;

    let filter = {
      senderId: userId,
      receiverId: req.user._id,
      read: false
    };

    if (rideId) {
      filter.rideId = rideId;
    }

    const result = await Message.updateMany(filter, { read: true });

    res.json({
      message: 'Messages marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/messages/:id/read
// @desc    Mark message as read
// @access  Private
router.put('/:id/read', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.receiverId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    message.read = true;
    await message.save();

    res.json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


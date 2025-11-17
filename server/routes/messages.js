const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Profile = require('../models/Profile');
const auth = require('../middleware/auth');

// Get inbox messages
router.get('/inbox', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      receiver: req.user.id,
      'deleted.receiverDeleted': false
    })
      .populate('sender', 'email')
      .populate('senderProfile', 'name coupleName accountType profilePicture')
      .sort({ createdAt: -1 })
      .limit(50);

    // Get unread count
    const unreadCount = await Message.countDocuments({
      receiver: req.user.id,
      read: false,
      'deleted.receiverDeleted': false
    });

    res.json({ messages, unreadCount });
  } catch (error) {
    console.error('Error fetching inbox:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get sent messages
router.get('/sent', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      sender: req.user.id,
      'deleted.senderDeleted': false
    })
      .populate('receiver', 'email')
      .populate('receiverProfile', 'name coupleName accountType profilePicture')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ messages });
  } catch (error) {
    console.error('Error fetching sent messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single message
router.get('/:id', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate('sender', 'email')
      .populate('receiver', 'email')
      .populate('senderProfile', 'name coupleName accountType profilePicture bio')
      .populate('receiverProfile', 'name coupleName accountType profilePicture bio');

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is sender or receiver
    if (message.sender._id.toString() !== req.user.id && 
        message.receiver._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Mark as read if receiver is viewing
    if (message.receiver._id.toString() === req.user.id && !message.read) {
      message.read = true;
      message.readAt = new Date();
      await message.save();
    }

    res.json({ message });
  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send message
router.post('/send', auth, async (req, res) => {
  try {
    const { receiverId, subject, message } = req.body;

    // Validation
    if (!receiverId || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (subject.length > 200) {
      return res.status(400).json({ message: 'Subject too long (max 200 characters)' });
    }

    if (message.length > 2000) {
      return res.status(400).json({ message: 'Message too long (max 2000 characters)' });
    }

    // Can't send to yourself
    if (receiverId === req.user.id) {
      return res.status(400).json({ message: 'Cannot send message to yourself' });
    }

    // Get sender and receiver profiles
    const senderProfile = await Profile.findOne({ userId: req.user.id });
    const receiverProfile = await Profile.findOne({ userId: receiverId });

    if (!receiverProfile) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    // Create message
    const newMessage = new Message({
      sender: req.user.id,
      receiver: receiverId,
      senderProfile: senderProfile?._id,
      receiverProfile: receiverProfile._id,
      subject,
      message
    });

    await newMessage.save();

    res.status(201).json({ 
      message: 'Message sent successfully',
      messageId: newMessage._id
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete message
router.delete('/:id', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Mark as deleted for the appropriate user
    if (message.sender.toString() === req.user.id) {
      message.deleted.senderDeleted = true;
    } else if (message.receiver.toString() === req.user.id) {
      message.deleted.receiverDeleted = true;
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }

    // If both deleted, remove from database
    if (message.deleted.senderDeleted && message.deleted.receiverDeleted) {
      await Message.findByIdAndDelete(req.params.id);
    } else {
      await message.save();
    }

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark message as read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.receiver.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    message.read = true;
    message.readAt = new Date();
    await message.save();

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get unread count
router.get('/unread/count', auth, async (req, res) => {
  try {
    const unreadCount = await Message.countDocuments({
      receiver: req.user.id,
      read: false,
      'deleted.receiverDeleted': false
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

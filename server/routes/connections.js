const express = require('express');
const router = express.Router();
const Connection = require('../models/Connection');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// Send connection request
router.post('/send/:receiverId', authMiddleware, async (req, res) => {
  try {
    const { receiverId } = req.params;
    const senderId = req.userId;

    // Check if sender and receiver are the same
    if (senderId === receiverId) {
      return res.status(400).json({ message: 'Cannot send connection to yourself' });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if connection already exists
    const existingConnection = await Connection.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ]
    });

    if (existingConnection) {
      return res.status(400).json({ 
        message: 'Connection request already exists',
        status: existingConnection.status
      });
    }

    // Create new connection request
    const connection = new Connection({
      sender: senderId,
      receiver: receiverId,
      status: 'pending'
    });

    await connection.save();

    res.status(201).json({ 
      message: 'Connection request sent successfully',
      connection
    });
  } catch (error) {
    console.error('Send connection error:', error);
    res.status(500).json({ message: 'Server error while sending connection request' });
  }
});

// Accept connection request
router.post('/accept/:connectionId', authMiddleware, async (req, res) => {
  try {
    const { connectionId } = req.params;
    const userId = req.userId;

    const connection = await Connection.findById(connectionId);

    if (!connection) {
      return res.status(404).json({ message: 'Connection request not found' });
    }

    console.log('Accept Request Debug:');
    console.log('Current User ID:', userId);
    console.log('Connection Receiver:', connection.receiver.toString());
    console.log('Connection Sender:', connection.sender.toString());
    console.log('Match:', connection.receiver.toString() === userId.toString());

    // Check if user is the receiver
    if (connection.receiver.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'You are not authorized to accept this request' });
    }

    // Update connection status
    connection.status = 'accepted';
    await connection.save();

    // Send automatic thank you message to start conversation
    try {
      const Message = require('../models/Message');
      const Profile = require('../models/Profile');
      
      // Get profiles to personalize the message
      const receiverProfile = await Profile.findOne({ userId: userId });
      const senderProfile = await Profile.findOne({ userId: connection.sender });
      
      const receiverName = receiverProfile?.name || receiverProfile?.coupleName || 'New Connection';
      const senderName = senderProfile?.name || senderProfile?.coupleName || 'there';
      
      // Create automatic thank you message
      const thankYouMessage = new Message({
        sender: userId, // Person who accepted (receiver of connection request)
        receiver: connection.sender, // Person who sent the connection request
        subject: '✨ Connection Accepted - Let\'s Connect!',
        message: `Hi ${senderName}! 👋\n\nThank you for connecting with me. I'm ${receiverName} and I'm excited to get to know you better!\n\nFeel free to message me anytime. Looking forward to our conversations! 😊`,
        read: false
      });
      
      await thankYouMessage.save();
      console.log('Automatic thank you message sent successfully');
    } catch (msgError) {
      console.error('Error sending automatic message:', msgError);
      // Don't fail the connection acceptance if message fails
    }

    res.json({ 
      message: 'Connection request accepted',
      connection
    });
  } catch (error) {
    console.error('Accept connection error:', error);
    res.status(500).json({ message: 'Server error while accepting connection' });
  }
});

// Reject connection request
router.post('/reject/:connectionId', authMiddleware, async (req, res) => {
  try {
    const { connectionId } = req.params;
    const userId = req.userId;

    const connection = await Connection.findById(connectionId);

    if (!connection) {
      return res.status(404).json({ message: 'Connection request not found' });
    }

    // Check if user is the receiver
    if (connection.receiver.toString() !== userId) {
      return res.status(403).json({ message: 'You are not authorized to reject this request' });
    }

    // Update connection status
    connection.status = 'rejected';
    await connection.save();

    res.json({ 
      message: 'Connection request rejected',
      connection
    });
  } catch (error) {
    console.error('Reject connection error:', error);
    res.status(500).json({ message: 'Server error while rejecting connection' });
  }
});

// Get connection status with a user
router.get('/status/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.userId;

    const connection = await Connection.findOne({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ]
    });

    if (!connection) {
      return res.json({ status: 'none', connection: null });
    }

    res.json({ 
      status: connection.status,
      connection,
      isSender: connection.sender.toString() === currentUserId
    });
  } catch (error) {
    console.error('Get connection status error:', error);
    res.status(500).json({ message: 'Server error while fetching connection status' });
  }
});

// Get all pending connection requests (received)
router.get('/pending', authMiddleware, async (req, res) => {
  try {
    const connections = await Connection.find({
      receiver: req.userId,
      status: 'pending'
    })
    .populate('sender', 'email accountType')
    .sort({ createdAt: -1 });

    res.json({ connections, count: connections.length });
  } catch (error) {
    console.error('Get pending connections error:', error);
    res.status(500).json({ message: 'Server error while fetching pending connections' });
  }
});

// Get all accepted connections
router.get('/accepted', authMiddleware, async (req, res) => {
  try {
    const Profile = require('../models/Profile');
    
    const connections = await Connection.find({
      $or: [
        { sender: req.userId, status: 'accepted' },
        { receiver: req.userId, status: 'accepted' }
      ]
    })
    .populate('sender', 'email accountType')
    .populate('receiver', 'email accountType')
    .sort({ updatedAt: -1 });

    // Fetch profiles for each connection
    const connectionsWithProfiles = await Promise.all(
      connections.map(async (connection) => {
        const otherUserId = connection.sender._id.toString() === req.userId.toString() 
          ? connection.receiver._id 
          : connection.sender._id;
        
        const profile = await Profile.findOne({ userId: otherUserId });
        
        return {
          _id: connection._id,
          userId: otherUserId,
          user: connection.sender._id.toString() === req.userId.toString() 
            ? connection.receiver 
            : connection.sender,
          profile: profile,
          status: connection.status,
          createdAt: connection.createdAt,
          updatedAt: connection.updatedAt
        };
      })
    );

    res.json({ connections: connectionsWithProfiles, count: connectionsWithProfiles.length });
  } catch (error) {
    console.error('Get accepted connections error:', error);
    res.status(500).json({ message: 'Server error while fetching accepted connections' });
  }
});

module.exports = router;

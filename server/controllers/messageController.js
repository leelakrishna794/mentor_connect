import Message from '../models/Message.js';
import User from '../models/User.js';

// @desc    Get all messages between current user and selected contact
// @route   GET /api/messages/:userId
// @access  Private
export const getMessages = async (req, res) => {
  try {
    const myId = req.user._id;
    const contactId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: contactId },
        { sender: contactId, receiver: myId },
      ],
    }).sort('createdAt');

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user._id;

    if (!content || !receiverId) {
      return res.status(400).json({ message: 'Receiver ID and content are required' });
    }

    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content,
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get recent chat contacts for dashboard or chat sidebar
// @route   GET /api/messages/contacts
// @access  Private
export const getContacts = async (req, res) => {
  try {
    const myId = req.user._id;

    if (req.user.role === 'admin') {
      const users = await User.find({ _id: { $ne: myId }, role: { $ne: 'admin' } }).select('name email role');
      return res.json(users);
    }

    // Find all messages involving the current user
    const messages = await Message.find({
      $or: [{ sender: myId }, { receiver: myId }],
    }).sort('-createdAt');

    // Extract unique contact IDs
    const contactIds = new Set();
    messages.forEach((msg) => {
      if (msg.sender.toString() !== myId.toString()) {
        contactIds.add(msg.sender.toString());
      }
      if (msg.receiver.toString() !== myId.toString()) {
        contactIds.add(msg.receiver.toString());
      }
    });

    // If no messages yet, for a better UX, mentors/mentees can see contacts from their booking list
    const users = await User.find({ _id: { $in: Array.from(contactIds) } }).select('name email role');

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

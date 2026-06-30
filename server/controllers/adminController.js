import User from '../models/User.js';
import Booking from '../models/Booking.js';
import MentorProfile from '../models/MentorProfile.js';
import Review from '../models/Review.js';
import Message from '../models/Message.js';

// @desc    Get dashboard metrics for Admin
// @route   GET /api/admin/stats
// @access  Private (Admin only)
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalMentors = await User.countDocuments({ role: 'mentor' });
    const totalMentees = await User.countDocuments({ role: 'mentee' });
    const totalBookings = await Booking.countDocuments();

    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const acceptedBookings = await Booking.countDocuments({ status: 'accepted' });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });

    const reviews = await Review.find();
    const averageRating =
      reviews.length > 0
        ? parseFloat((reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length).toFixed(1))
        : 0;

    res.json({
      totalUsers,
      totalMentors,
      totalMentees,
      totalBookings,
      bookingStats: {
        pending: pendingBookings,
        accepted: acceptedBookings,
        completed: completedBookings,
      },
      averageRating,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'mentor') {
      await MentorProfile.findOneAndDelete({ user: user._id });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User and profile removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all mentors (both approved and pending)
// @route   GET /api/admin/mentors
// @access  Private (Admin only)
export const getAdminMentors = async (req, res) => {
  try {
    const mentors = await MentorProfile.find().populate('user', 'name email role');
    res.json(mentors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve a mentor profile
// @route   PUT /api/admin/mentors/:id/approve
// @access  Private (Admin only)
export const approveMentor = async (req, res) => {
  try {
    const profile = await MentorProfile.findOne({ user: req.params.id });

    if (!profile) {
      return res.status(404).json({ message: 'Mentor profile not found' });
    }

    profile.isApproved = true;
    await profile.save();

    res.json({ message: 'Mentor profile approved successfully', profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve any user registration (mentor or mentee)
// @route   PUT /api/admin/users/:id/approve
// @access  Private (Admin only)
export const approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isApproved = true;
    await user.save();

    // Sync with MentorProfile if role is mentor
    if (user.role === 'mentor') {
      await MentorProfile.findOneAndUpdate({ user: user._id }, { isApproved: true });
    }

    res.json({ message: 'User approved successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all chat logs for monitoring
// @route   GET /api/admin/messages
// @access  Private (Admin only)
export const getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find()
      .populate('sender', 'name email role')
      .populate('receiver', 'name email role')
      .sort('-createdAt');
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

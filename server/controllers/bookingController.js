import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import MentorProfile from '../models/MentorProfile.js';
import Review from '../models/Review.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

// @desc    Book a mentoring session
// @route   POST /api/bookings
// @access  Private (Mentee only)
export const createBooking = async (req, res) => {
  try {
    const { mentorId, menteeId, date, time, notes } = req.body;

    let targetMenteeId;

    if (req.user.role === 'admin') {
      if (!menteeId) {
        return res.status(400).json({ message: 'Mentee ID is required for admin assignments' });
      }
      targetMenteeId = menteeId;
    } else {
      if (req.user.role !== 'mentee') {
        return res.status(400).json({ message: 'Only mentees can book mentoring sessions' });
      }
      targetMenteeId = req.user._id;
    }

    // Verify mentor exists
    const mentor = await User.findById(mentorId);
    if (!mentor || mentor.role !== 'mentor') {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    // Verify mentee exists
    const mentee = await User.findById(targetMenteeId);
    if (!mentee || mentee.role !== 'mentee') {
      return res.status(404).json({ message: 'Mentee not found' });
    }

    // Check if slot is already booked for this mentor
    const existingBooking = await Booking.findOne({
      mentor: mentorId,
      date,
      time,
      status: { $in: ['pending', 'accepted'] },
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'This slot is already booked' });
    }

    const bookingId = new mongoose.Types.ObjectId();
    const meetingLink = `https://meet.jit.si/MentorConnect-${bookingId}`;

    const booking = await Booking.create({
      _id: bookingId,
      mentor: mentorId,
      mentee: targetMenteeId,
      date,
      time,
      notes: notes || (req.user.role === 'admin' ? 'Assigned by Administrator' : ''),
      status: req.user.role === 'admin' ? 'accepted' : 'pending',
      meetingLink,
    });

    if (req.user.role === 'admin') {
      await Notification.create({
        user: mentorId,
        message: `An administrator has scheduled a mentoring session for you with mentee ${mentee.name} on ${date} at ${time}.`,
      });
      await Notification.create({
        user: targetMenteeId,
        message: `An administrator has scheduled a mentoring session for you with mentor ${mentor.name} on ${date} at ${time}.`,
      });
    } else {
      await Notification.create({
        user: mentorId,
        message: `${mentee.name} has requested a mentoring session with you on ${date} at ${time}.`,
      });
    }

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings
// @access  Private
export const getBookings = async (req, res) => {
  try {
    let bookings;

    if (req.user.role === 'mentor') {
      bookings = await Booking.find({ mentor: req.user._id })
        .populate('mentee', 'name email')
        .sort('-createdAt');
    } else if (req.user.role === 'mentee') {
      bookings = await Booking.find({ mentee: req.user._id })
        .populate('mentor', 'name email')
        .sort('-createdAt');
    } else {
      // Admin gets all bookings
      bookings = await Booking.find()
        .populate('mentor', 'name email')
        .populate('mentee', 'name email')
        .sort('-createdAt');
    }

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update booking status (accept, reject, cancel, complete)
// @route   PUT /api/bookings/:id
// @access  Private
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'accepted', 'rejected', 'cancelled', 'completed'
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Permission checks
    if (req.user.role === 'mentor' && booking.mentor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }
    if (req.user.role === 'mentee' && booking.mentee.toString() !== req.user._id.toString()) {
      // Mentee can only cancel
      if (status !== 'cancelled') {
        return res.status(403).json({ message: 'Mentees can only cancel bookings' });
      }
    }

    booking.status = status;
    await booking.save();

    await booking.populate('mentor mentee', 'name');

    if (status === 'accepted') {
      await Notification.create({
        user: booking.mentee._id,
        message: `Your mentoring session request with ${booking.mentor.name} on ${booking.date} at ${booking.time} was ACCEPTED.`,
      });
    } else if (status === 'rejected') {
      await Notification.create({
        user: booking.mentee._id,
        message: `Your mentoring session request with ${booking.mentor.name} on ${booking.date} at ${booking.time} was REJECTED.`,
      });
    } else if (status === 'cancelled') {
      const recipientId = req.user.role === 'mentor' ? booking.mentee._id : booking.mentor._id;
      const cancellerName = req.user.name;
      await Notification.create({
        user: recipientId,
        message: `The mentoring session scheduled for ${booking.date} at ${booking.time} has been CANCELLED by ${cancellerName}.`,
      });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add review for mentor
// @route   POST /api/bookings/:id/review
// @access  Private (Mentee only)
export const addReview = async (req, res) => {
  try {
    const { rating, reviewText } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.mentee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the booked mentee can review this session' });
    }

    const mentorId = booking.mentor;

    // Check if review already exists
    const existingReview = await Review.findOne({ mentor: mentorId, mentee: req.user._id });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this mentor' });
    }

    const review = await Review.create({
      mentor: mentorId,
      mentee: req.user._id,
      rating: Number(rating),
      reviewText,
    });

    // Update Mentor Profile average rating
    const mentorReviews = await Review.find({ mentor: mentorId });
    const averageRating = mentorReviews.reduce((acc, item) => item.rating + acc, 0) / mentorReviews.length;

    await MentorProfile.findOneAndUpdate(
      { user: mentorId },
      {
        rating: parseFloat(averageRating.toFixed(1)),
        numReviews: mentorReviews.length,
      }
    );

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

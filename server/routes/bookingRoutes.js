import express from 'express';
import { createBooking, getBookings, updateBookingStatus, addReview } from '../controllers/bookingController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .post(protect, createBooking)
  .get(protect, getBookings);

router.route('/:id')
  .put(protect, updateBookingStatus);

router.route('/:id/review')
  .post(protect, addReview);

export default router;

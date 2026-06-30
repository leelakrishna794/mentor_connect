import mongoose from 'mongoose';

const mentorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: [true, 'Please add a professional title'],
    },
    company: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      required: [true, 'Please add a bio'],
    },
    skills: {
      type: [String],
      default: [],
    },
    experience: {
      type: Number,
      required: [true, 'Please specify years of experience'],
    },
    education: {
      type: String,
      default: '',
    },
    profilePicture: {
      type: String,
      default: '',
    },
    availability: [
      {
        day: {
          type: String, // e.g., 'Monday', 'Tuesday', or specific dates like '2026-07-05'
          required: true,
        },
        slots: {
          type: [String], // e.g., ['09:00', '14:00', '16:00']
          default: [],
        },
      },
    ],
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('MentorProfile', mentorProfileSchema);

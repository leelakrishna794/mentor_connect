import MentorProfile from '../models/MentorProfile.js';
import User from '../models/User.js';
import Review from '../models/Review.js';

// @desc    Get all mentors with search and filters
// @route   GET /api/mentors
// @access  Public
export const getMentors = async (req, res) => {
  try {
    const { keyword, skill, experience, rating, sort } = req.query;

    let query = { isApproved: true };

    // Filter by skill
    if (skill) {
      query.skills = { $in: [new RegExp(skill, 'i')] };
    }

    // Filter by experience (minimum years)
    if (experience) {
      query.experience = { $gte: Number(experience) };
    }

    // Filter by rating (minimum rating)
    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    // Populate user and find match
    let mentors = await MentorProfile.find(query).populate('user', 'name email role');

    // Filter by keyword in user name or title if specified
    if (keyword) {
      const reg = new RegExp(keyword, 'i');
      mentors = mentors.filter(
        (m) => (m.user && reg.test(m.user.name)) || reg.test(m.title) || reg.test(m.bio)
      );
    }

    // Sorting
    if (sort) {
      if (sort === 'rating') {
        mentors.sort((a, b) => b.rating - a.rating);
      } else if (sort === 'experience') {
        mentors.sort((a, b) => b.experience - a.experience);
      }
    }

    res.json(mentors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get mentor profile details by mentor user ID
// @route   GET /api/mentors/:id
// @access  Public
export const getMentorById = async (req, res) => {
  try {
    const mentorUser = await User.findById(req.params.id);
    if (!mentorUser || mentorUser.role !== 'mentor') {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    const profile = await MentorProfile.findOne({ user: req.params.id }).populate('user', 'name email');
    if (!profile) {
      return res.status(404).json({ message: 'Mentor profile not found' });
    }

    const reviews = await Review.find({ mentor: req.params.id }).populate('mentee', 'name');

    res.json({
      profile,
      reviews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update mentor profile
// @route   PUT /api/mentors/:id
// @access  Private (Mentor only)
export const updateMentorProfile = async (req, res) => {
  try {
    // Check ownership
    if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    const { title, company, bio, skills, experience, education, profilePicture, availability } = req.body;

    let profile = await MentorProfile.findOne({ user: req.params.id });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    profile.title = title || profile.title;
    profile.company = company !== undefined ? company : profile.company;
    profile.bio = bio || profile.bio;
    profile.skills = skills || profile.skills;
    profile.experience = experience !== undefined ? Number(experience) : profile.experience;
    profile.education = education !== undefined ? education : profile.education;
    profile.profilePicture = profilePicture !== undefined ? profilePicture : profile.profilePicture;
    profile.availability = availability || profile.availability;

    const updatedProfile = await profile.save();

    // Also update User name if provided
    if (req.body.name) {
      const user = await User.findById(req.params.id);
      if (user) {
        user.name = req.body.name;
        await user.save();
      }
    }

    res.json(updatedProfile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

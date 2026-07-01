import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import MentorProfile from '../models/MentorProfile.js';
import MenteeProfile from '../models/MenteeProfile.js';

// Generate JWT token helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_key_mentorconnect_2026', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'mentee',
    });

    if (user) {
      // Create empty profile dependent on role
      if (user.role === 'mentor') {
        await MentorProfile.create({
          user: user._id,
          title: 'Aspiring Mentor',
          bio: 'Tell us about yourself...',
          experience: 1,
          skills: [],
          availability: [
            { day: 'Monday', slots: ['09:00', '10:00', '14:00'] },
            { day: 'Wednesday', slots: ['09:00', '10:00', '14:00'] },
            { day: 'Friday', slots: ['09:00', '10:00', '14:00'] }
          ],
        });
      } else if (user.role === 'mentee') {
        await MenteeProfile.create({
          user: user._id,
          bio: 'Aspiring Learner',
          interests: [],
          goals: '',
        });
      }

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      if (!user.isApproved && user.role !== 'admin') {
        return res.status(401).json({ message: 'Your account is pending administrator approval.' });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile (including role-specific profile details)
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      let profileDetails = null;

      if (user.role === 'mentor') {
        profileDetails = await MentorProfile.findOne({ user: user._id });
      } else if (user.role === 'mentee') {
        profileDetails = await MenteeProfile.findOne({ user: user._id });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: profileDetails,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate OTP and request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'No user registered with this email address' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set OTP and expiration (10 minutes)
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    // MOCK OTP LOGGING: Since there's no SMTP configured, we log the OTP to the server console and also return it in response for convenience in testing!
    console.log(`==========================================`);
    console.log(`PASSWORD RESET OTP FOR ${email}: ${otp}`);
    console.log(`==========================================`);

    res.json({ 
      message: 'Password reset OTP has been sent successfully.', 
      otpForTesting: otp // Providing for quick validation
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP and reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({ 
      email,
      resetPasswordOTP: otp,
      resetPasswordOTPExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP. Please request a new one.' });
    }

    // Update password
    user.password = newPassword;
    // Clear OTP details
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpires = undefined;
    await user.save();

    res.json({ message: 'Password has been reset successfully. Please log in with your new password.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

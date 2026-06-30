import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import MentorProfile from './models/MentorProfile.js';
import MenteeProfile from './models/MenteeProfile.js';
import Review from './models/Review.js';

dotenv.config();

const usersData = [
  {
    name: 'Admin User',
    email: 'admin@mentorconnect.com',
    password: 'password123',
    role: 'admin',
  },
  {
    name: 'Sarah Connor',
    email: 'sarah@mentorconnect.com',
    password: 'password123',
    role: 'mentor',
    profile: {
      title: 'Principal Software Architect',
      company: 'Cyberdyne Systems',
      bio: 'Over 15 years of industry experience specializing in high-performance cloud architectures, database scaling, security protocols, and machine learning pipelines. Passionate about engineering leadership and career coaching.',
      skills: ['System Design', 'Cloud Architecture', 'Python', 'Go', 'Security'],
      experience: 15,
      education: 'M.S. in Computer Science, Stanford University',
      isApproved: true,
      availability: [
        { day: 'Monday', slots: ['09:00', '11:00', '15:00'] },
        { day: 'Wednesday', slots: ['10:00', '14:00', '16:00'] },
        { day: 'Friday', slots: ['13:00', '15:00'] }
      ]
    }
  },
  {
    name: 'Leela Krishna M',
    email: 'leela@mentorconnect.com',
    password: 'password123',
    role: 'mentor',
    profile: {
      title: 'Senior MERN Developer',
      company: 'Tech Solutions Inc',
      bio: 'Full Stack Engineer with expertise in building responsive single-page web applications. Love explaining React hooks, Node.js cluster processes, express routing, MongoDB aggregation pipelines, and WebSockets.',
      skills: ['React', 'Node.js', 'Express', 'MongoDB', 'Socket.IO'],
      experience: 6,
      education: 'B.Tech in Computer Science',
      isApproved: true,
      availability: [
        { day: 'Tuesday', slots: ['09:00', '10:00', '14:00'] },
        { day: 'Thursday', slots: ['10:00', '14:00', '16:00'] }
      ]
    }
  },
  {
    name: 'Alex Rivera',
    email: 'alex@mentorconnect.com',
    password: 'password123',
    role: 'mentee',
    profile: {
      bio: 'Junior web developer looking to specialize in MERN stack and improve system design concepts.',
      interests: ['React', 'System Design', 'Node.js'],
      goals: 'To transition into a Full Stack Developer role within the next 6 months.'
    }
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mentorconnect');
    console.log('Database connected for seeding...');

    // Clear existing data
    await User.deleteMany();
    await MentorProfile.deleteMany();
    await MenteeProfile.deleteMany();
    await Review.deleteMany();
    console.log('Cleared existing data.');

    for (const u of usersData) {
      const createdUser = await User.create({
        name: u.name,
        email: u.email,
        password: u.password,
        role: u.role,
        isApproved: true,
      });

      console.log(`Created User: ${createdUser.name} (${createdUser.role})`);

      if (u.role === 'mentor' && u.profile) {
        await MentorProfile.create({
          user: createdUser._id,
          ...u.profile
        });
        console.log(`Created Mentor Profile for ${createdUser.name}`);
      } else if (u.role === 'mentee' && u.profile) {
        await MenteeProfile.create({
          user: createdUser._id,
          ...u.profile
        });
        console.log(`Created Mentee Profile for ${createdUser.name}`);
      }
    }

    // Add a sample review
    const mentorUser = await User.findOne({ email: 'leela@mentorconnect.com' });
    const menteeUser = await User.findOne({ email: 'alex@mentorconnect.com' });

    if (mentorUser && menteeUser) {
      await Review.create({
        mentor: mentorUser._id,
        mentee: menteeUser._id,
        rating: 5,
        reviewText: 'Leela is an amazing mentor! He explained React context and Socket.IO workflows extremely clearly. Highly recommended!',
      });

      // Update mentor profile
      await MentorProfile.findOneAndUpdate(
        { user: mentorUser._id },
        { rating: 5, numReviews: 1 }
      );
      console.log('Added sample review.');
    }

    console.log('Database seeded successfully!');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();

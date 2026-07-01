import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import mentorRoutes from './routes/mentorRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' })); // support large base64 uploads
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'API Route Not Found' });
});

export default app;

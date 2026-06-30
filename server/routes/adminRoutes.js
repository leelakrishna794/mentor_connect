import express from 'express';
import { getAdminStats, getAllUsers, deleteUser, getAdminMentors, approveMentor, approveUser, getAllMessages } from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', protect, authorize('admin'), getAdminStats);
router.get('/users', protect, authorize('admin'), getAllUsers);
router.get('/mentors', protect, authorize('admin'), getAdminMentors);
router.get('/messages', protect, authorize('admin'), getAllMessages);
router.put('/users/:id/approve', protect, authorize('admin'), approveUser);
router.put('/mentors/:id/approve', protect, authorize('admin'), approveMentor);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

export default router;

import express from 'express';
import { getMentors, getMentorById, updateMentorProfile } from '../controllers/mentorController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getMentors);
router.get('/:id', getMentorById);
router.put('/:id', protect, updateMentorProfile);

export default router;

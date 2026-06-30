import express from 'express';
import { getMessages, sendMessage, getContacts } from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/contacts', protect, getContacts);
router.get('/:userId', protect, getMessages);
router.post('/', protect, sendMessage);

export default router;

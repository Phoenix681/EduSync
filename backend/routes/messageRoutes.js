import express from 'express';
import { getChatHistory, markMessagesAsRead, getUnreadCount } from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/unread-count', protect, getUnreadCount);
router.put('/mark-read/:senderId', protect, markMessagesAsRead);
router.get('/:targetUserId', protect, getChatHistory);

export default router;
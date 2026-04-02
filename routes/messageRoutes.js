import express from 'express';
import { getChatHistory } from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:targetUserId', protect, getChatHistory);

export default router;
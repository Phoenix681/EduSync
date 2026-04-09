import express from 'express';
import { registerUser, loginUser, getMe, getContacts } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.get('/contacts', protect, getContacts);

export default router;
import express from 'express';
import {
  createModule,
  getPublicModules,
  getModuleById,
} from '../controllers/moduleController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getPublicModules);

router.post('/', protect, authorize('Educator'), createModule);

router.get('/:id', protect, getModuleById);

export default router;
import express from 'express';
import {
  createModule,
  getPublicModules,
  getModuleById,
  updateModule,
  deleteModule,
} from '../controllers/moduleController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getPublicModules);

router.post('/', protect, authorize('Educator'), createModule);

router.get('/:id', protect, getModuleById);

router.put('/:id', protect, authorize('Educator'), updateModule);

router.delete('/:id', protect, authorize('Educator'), deleteModule);

export default router;
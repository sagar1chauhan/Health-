import { Router } from 'express';
import { createSession, getSessions, updateSession } from './telemedicine.controller.js';
import { protect, authorize } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(protect);
router.get('/', getSessions);
router.post('/', authorize('doctor', 'admin'), createSession);
router.put('/:id', authorize('doctor'), updateSession);

export default router;

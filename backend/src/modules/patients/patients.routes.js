import { Router } from 'express';
import { getPatientProfile, updatePatientProfile, getPatientById } from './patients.controller.js';
import { protect, authorize } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

router.get('/profile', authorize('patient'), getPatientProfile);
router.put('/profile', authorize('patient'), updatePatientProfile);
router.get('/:id', authorize('doctor', 'admin'), getPatientById);

export default router;

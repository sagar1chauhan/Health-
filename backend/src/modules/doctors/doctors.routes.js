import { Router } from 'express';
import { getDoctors, getDoctorById, updateDoctorProfile, verifyDoctor } from './doctors.controller.js';
import { protect, authorize } from '../../middleware/auth.middleware.js';

const router = Router();

router.get('/', getDoctors); // Public to view doctors
router.get('/:id', getDoctorById); // Public to view doctor details

router.use(protect);
router.put('/profile', authorize('doctor'), updateDoctorProfile);
router.put('/:id/verify', authorize('admin'), verifyDoctor);

export default router;

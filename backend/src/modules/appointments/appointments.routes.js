import { Router } from 'express';
import { createAppointment, getAppointments, updateAppointmentStatus } from './appointments.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

router.post('/', createAppointment);
router.get('/', getAppointments);
router.put('/:id/status', updateAppointmentStatus);

export default router;

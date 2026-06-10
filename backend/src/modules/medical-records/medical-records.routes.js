import { Router } from 'express';
import { uploadRecord, getRecords } from './medical-records.controller.js';
import { protect, authorize } from '../../middleware/auth.middleware.js';
import { uploadMultiple } from '../../middleware/upload.middleware.js';

const router = Router();

router.use(protect);

router.post('/', authorize('patient', 'doctor'), uploadMultiple, uploadRecord);
router.get('/', authorize('patient', 'doctor'), getRecords);

export default router;

import { Router } from 'express';
import { getWearableData, addWearableData } from './wearables.controller.js';
import { protect, authorize } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(protect);
router.get('/', authorize('patient'), getWearableData);
router.post('/', authorize('patient'), addWearableData);

export default router;

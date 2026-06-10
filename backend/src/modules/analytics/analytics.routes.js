import { Router } from 'express';
import { getOverviewAnalytics, getDiseaseStats } from './analytics.controller.js';
import { protect, authorize } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(protect);
router.get('/overview', authorize('admin'), getOverviewAnalytics);
router.get('/disease-stats', authorize('admin'), getDiseaseStats);

export default router;

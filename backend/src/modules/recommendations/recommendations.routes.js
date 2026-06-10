import { Router } from 'express';
import { getRecommendations, getLatestRecommendation } from './recommendations.controller.js';
import { protect, authorize } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(protect);
router.get('/', authorize('patient'), getRecommendations);
router.get('/latest', authorize('patient'), getLatestRecommendation);

export default router;

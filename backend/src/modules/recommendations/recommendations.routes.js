import { Router } from 'express';
import { getRecommendations, getLatestRecommendation, getRecommendationById } from './recommendations.controller.js';
import { protect, authorize } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(protect);
router.get('/', authorize('patient'), getRecommendations);
router.get('/latest', authorize('patient'), getLatestRecommendation);
router.get('/:id', authorize('patient'), getRecommendationById);

export default router;

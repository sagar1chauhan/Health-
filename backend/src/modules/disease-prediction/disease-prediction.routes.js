import { Router } from 'express';
import { predictDisease, getPredictionHistory } from './disease-prediction.controller.js';
import { protect, authorize } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(protect);
router.post('/predict', authorize('patient'), predictDisease);
router.get('/history', authorize('patient'), getPredictionHistory);

export default router;

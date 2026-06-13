import { Router } from 'express';
import { sendMessage, getChatHistory, getChatSession } from './ai-assistant.controller.js';
import { protect, authorize } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(protect);
router.post('/chat', authorize('patient'), sendMessage);
router.get('/history', authorize('patient'), getChatHistory);
router.get('/session/:sessionId', authorize('patient'), getChatSession);

export default router;

import { Router } from 'express';
import { register, login, logout, refreshToken, getMe, forgotPassword, resetPassword, verifyEmail, resendVerificationEmail } from './auth.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.post('/refresh-token', refreshToken);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', protect, resendVerificationEmail);

export default router;


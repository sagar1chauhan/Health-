import { Router } from 'express';
import { getUsers, getUser, updateUserStatus, deleteUser, getUserStats } from './users.controller.js';
import { protect, authorize } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

router.get('/stats', authorize('admin'), getUserStats);
router.get('/', authorize('admin'), getUsers);
router.get('/:id', authorize('admin', 'doctor'), getUser);
router.put('/:id/status', authorize('admin'), updateUserStatus);
router.delete('/:id', authorize('admin'), deleteUser);

export default router;

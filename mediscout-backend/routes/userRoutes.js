import express from 'express';
import {
  getUsers,
  createUser,
  getUserById,
  updateUser,
  toggleBlockUser,
  getActivePharmacists,
  getActiveDeliveryReps,
  deleteUser,
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. مسارات جلب الكوادر المتاحة للنظام
router.get('/pharmacists', getActivePharmacists);
router.get('/delivery-reps', getActiveDeliveryReps);

// 2. تطبيق حماية Admin على بقية المسارات الإدارية فقط
router.use(protect, authorize('admin'));

router.route('/')
  .get(getUsers)
  .post(createUser);

router.patch('/:id/block', toggleBlockUser);

// 3. المسارات الديناميكية (/:id) توضع في النهاية دائماً لمنع التداخل
router.route('/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);

export default router;
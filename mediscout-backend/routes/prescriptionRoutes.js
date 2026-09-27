import express from 'express';
import { 
  processPrescription, 
  approveByPharmacist,
  getPrescriptionById,
  getPharmacistPrescriptions,
  getMyPrescriptions,
  checkoutPrescription,
  getDeliveryPrescriptions,
  updateDeliveryStatus,
  updatePatientDecisions,
  createStripeCheckoutSession,
  verifyStripePayment,
} from '../controllers/prescriptionController.js';
import { protect, optionalProtect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. مسارات الروشتات المتاحة للزوار والمرضى
router.post('/process', optionalProtect, processPrescription);
router.put('/:id/patient-decisions', optionalProtect, updatePatientDecisions);

// 2. مسارات تتطلب تسجيل دخول المريض
router.get('/my-history', protect, getMyPrescriptions);
router.post('/:id/checkout', protect, checkoutPrescription);
router.post('/:id/create-checkout-session', protect, createStripeCheckoutSession);
router.post('/:id/verify-payment', protect, verifyStripePayment);

// 3. مسارات الصيدلي
router.get('/pharmacist-queue', protect, authorize('pharmacist'), getPharmacistPrescriptions);
router.get('/pending', protect, authorize('pharmacist'), getPharmacistPrescriptions);
router.put('/:id/pharmacist-approve', protect, authorize('pharmacist'), approveByPharmacist);

// 4. مسارات مندوب التوصيل
router.get('/delivery-queue', protect, authorize('delivery'), getDeliveryPrescriptions);
router.put('/:id/delivery-status', protect, authorize('delivery'), updateDeliveryStatus);

// 5. جلب تفاصيل روشتة بـ ID (توضع في النهاية)
router.get('/:id', optionalProtect, getPrescriptionById);

export default router;
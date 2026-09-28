import { apiClient } from '../../../services/apiClient';
import { type Prescription, type PrescriptionItem } from '../../../types';

export interface PharmacistUser {
  _id: string;
  name: string;
  email?: string;
}

export interface ProcessPrescriptionPayload {
  imageBase64: string;
  mimeType: string;
  patientName: string;
  phone: string;
  address: string;
  email?: string;
  pharmacistId: string;
}

export interface ProcessPrescriptionResponse {
  success: boolean;
  status: 'READY_FOR_CART' | 'PENDING_PHARMACIST_REVIEW';
  requiresPharmacistReview: boolean;
  prescription: Prescription;
}

export interface GetPendingPrescriptionsResponse {
  success: boolean;
  count: number;
  prescriptions: Prescription[];
}

export interface ApproveByPharmacistResponse {
  success: boolean;
  message: string;
  prescription: Prescription;
}

export interface GetPrescriptionByIdResponse {
  success?: boolean;
  prescription: Prescription;
}

// 1. معالجة الروشتة وإرسالها للتحليل مع تحديد الصيدلي
export const processPrescriptionAPI = async (
  payload: ProcessPrescriptionPayload
): Promise<ProcessPrescriptionResponse> => {
  const response = await apiClient.post<ProcessPrescriptionResponse>(
    '/prescriptions/process',
    payload
  );
  return response.data;
};

// 2. جلب قائمة الصيادلة النشطين
export const getActivePharmacistsAPI = async (): Promise<PharmacistUser[]> => {
  const response = await apiClient.get<PharmacistUser[]>('/users/pharmacists');
  return response.data;
};

// 2.5 جلب قائمة مناديب التوصيل النشطين
export const getActiveDeliveryRepsAPI = async (): Promise<PharmacistUser[]> => {
  const response = await apiClient.get<PharmacistUser[]>('/users/delivery-reps');
  return response.data;
};

// 3. جلب الروشتات المعلقة للصيدلي (مع قبول pharmacistId)
export const getPendingPrescriptionsAPI = async (
  pharmacistId?: string
): Promise<Prescription[]> => {
  const response = await apiClient.get<GetPendingPrescriptionsResponse>(
    '/prescriptions/pending',
    { params: { pharmacistId } }
  );
  return response.data.prescriptions;
};

// 4. اعتماد الروشتة بواسطة الصيدلي (مع قبول pharmacistId)
export const approveByPharmacistAPI = async (
  prescriptionId: string,
  updatedItems?: PrescriptionItem[],
  pharmacistId?: string
): Promise<ApproveByPharmacistResponse> => {
  const response = await apiClient.put<ApproveByPharmacistResponse>(
    `/prescriptions/${prescriptionId}/pharmacist-approve`,
    { updatedItems, pharmacistId }
  );
  return response.data;
};

// 5. جلب حالة روشتة معينة برقمها
export const getPrescriptionByIdAPI = async (
  prescriptionId: string
): Promise<GetPrescriptionByIdResponse> => {
  const response = await apiClient.get<GetPrescriptionByIdResponse>(
    `/prescriptions/${prescriptionId}`
  );
  return response.data;
};

export const getUserPrescriptionsAPI = async (): Promise<Prescription[]> => {
  const response = await apiClient.get<{ success: boolean; prescriptions: Prescription[] }>('/prescriptions/my-history');
  return response.data.prescriptions || [];
};

// 5.5 تحديث قرارات المريض للأدوية البديلة
export const updatePatientDecisionsAPI = async (
  prescriptionId: string,
  items: PrescriptionItem[]
): Promise<{ success: boolean; message: string; prescription: Prescription }> => {
  const response = await apiClient.put<{ success: boolean; message: string; prescription: Prescription }>(
    `/prescriptions/${prescriptionId}/patient-decisions`,
    { items }
  );
  return response.data;
};

// 6. إتمام شراء الطلب (Checkout)
export const checkoutPrescriptionAPI = async (
  payload: { prescriptionId: string; patientName: string; phone: string; address: string; deliveryId?: string; paymentMethod: 'CASH_ON_DELIVERY' | 'CARD'; items?: PrescriptionItem[] }
): Promise<{ success: boolean; message: string; prescription: Prescription }> => {
  const response = await apiClient.post<{ success: boolean; message: string; prescription: Prescription }>(
    `/prescriptions/${payload.prescriptionId}/checkout`,
    {
      patientName: payload.patientName,
      phone: payload.phone,
      address: payload.address,
      deliveryId: payload.deliveryId,
      paymentMethod: payload.paymentMethod,
      items: payload.items,
    }
  );
  return response.data;
};

// 7. جلب قائمة طلبات مندوب التوصيل
export const getDeliveryPrescriptionsAPI = async (): Promise<Prescription[]> => {
  const response = await apiClient.get<{ success: boolean; prescriptions: Prescription[] }>('/prescriptions/delivery-queue');
  return response.data.prescriptions || [];
};

// 8. تحديث حالة الطلب بواسطة مندوب التوصيل
export const updateDeliveryStatusAPI = async (
  prescriptionId: string,
  status: 'ORDER_PROCESSING' | 'ORDER_COMPLETED' | 'CANCELLED',
  cancelReason?: string
): Promise<{ success: boolean; message: string; prescription: Prescription }> => {
  const response = await apiClient.put<{ success: boolean; message: string; prescription: Prescription }>(
    `/prescriptions/${prescriptionId}/delivery-status`,
    { status, cancelReason }
  );
  return response.data;
};

// 9. إنشاء جلسة دفع Stripe للبطاقات الائتمانية
export const createStripeCheckoutSessionAPI = async (payload: {
  prescriptionId: string;
  patientName: string;
  phone: string;
  address: string;
  deliveryId?: string;
  items?: PrescriptionItem[];
}): Promise<{
  success: boolean;
  sessionId?: string;
  url?: string;
  isSimulated?: boolean;
  message?: string;
}> => {
  const response = await apiClient.post(
    `/prescriptions/${payload.prescriptionId}/create-checkout-session`,
    payload
  );
  return response.data;
};

// 10. تأكيد نجاح الدفع الإلكتروني بـ Stripe
export const verifyStripePaymentAPI = async (
  prescriptionId: string,
  sessionId?: string
): Promise<{ success: boolean; message: string; prescription: Prescription }> => {
  const response = await apiClient.post(
    `/prescriptions/${prescriptionId}/verify-payment`,
    { sessionId }
  );
  return response.data;
};
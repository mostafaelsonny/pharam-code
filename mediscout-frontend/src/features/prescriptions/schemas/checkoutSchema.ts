import { z } from 'zod';

export const checkoutSchema = z.object({
  patientName: z
    .string()
    .min(3, 'يرجى إدخال اسم المريض بالكامل (3 أحرف على الأقل)'),
  phone: z
    .string()
    .min(10, 'يرجى إدخال رقم هاتف صحيح (10 أرقام على الأقل)'),
  address: z
    .string()
    .min(5, 'يرجى إدخال عنوان تسليم تفصيلي'),
  deliveryId: z
    .string()
    .min(1, 'يرجى اختيار مندوب التوصيل المسؤول'),
  paymentMethod: z.enum(['CASH_ON_DELIVERY', 'CARD'] as const, {
    message: 'يرجى اختيار طريقة الدفع',
  }),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;

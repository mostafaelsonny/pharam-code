import { z } from 'zod';

export const processPrescriptionSchema = z.object({
  patientName: z.string().min(2, 'يرجى إدخال اسم المريض'),
  phone: z
    .string()
    .min(11, 'رقم الهاتف يجب أن يكون 11 رقم')
    .regex(/^01[0125][0-9]{8}$/, 'يرجى إدخال رقم هاتف مصري صحيح'),
  address: z.string().min(5, 'عنوان التسليم مطلوب لتوصيل الروشتة'),
  email: z.string().email('البريد الإلكتروني غير صحيح').optional().or(z.literal('')),
  pharmacistId: z.string().min(1, 'يرجى اختيار الصيدلي الموجه له الروشتة'),
  image: z
    .any()
    .refine((files) => files && files.length > 0, 'يرجى التقاط أو اختيار صورة الروشتة'),
});

export type ProcessPrescriptionFormValues = z.infer<typeof processPrescriptionSchema>;
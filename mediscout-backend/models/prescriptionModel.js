import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // يمكن إنشاؤها بدون تسجيل دخول وربطها عند الـ Checkout
    },
    patientName: { type: String, required: true, default: 'مريض' },
    patientInfo: {
      phone: { type: String, required: true },
      email: { type: String },
      address: { type: String, required: true },
    },
    // ربط الروشتة بالصيدلي المحدد من قبل المريض
    pharmacistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'يرجى اختيار الصيدلي الموجه له الروشتة'],
    },
    // ربط الروشتة بمندوب التوصيل المحدد عند إتمام الطلب
    deliveryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    originalImage: {
  data: { type: String, required: true },
  mimeType: { type: String, required: true },
},
    items: [
      {
        drugId: { type: mongoose.Schema.Types.ObjectId, ref: 'Drug' },
        drugName: { type: String, required: true },
        activeIngredient: { type: String },
        dosage: { type: String },
        quantity: { type: Number, default: 1 },
        price: { type: Number, default: 0 },
        inStock: { type: Boolean, default: false },
        
        // حالة الصنف في المخزن (متوفر / له بديل / غير متوفر)
        availabilityStatus: {
          type: String,
          enum: ['AVAILABLE', 'ALTERNATIVE_AVAILABLE', 'OUT_OF_STOCK'],
          default: 'AVAILABLE',
        },
        
        isAlternative: { type: Boolean, default: false },
        suggestedAlternativeFor: { type: String }, // اسم العلاج الأصلي المكتوب
        
        // ملحوظات الصيدلي للجرعة أو الاستخدام
        pharmacistNotes: { type: String, default: '' },
        
        reviewStatus: {
          type: String,
          enum: ['APPROVED', 'PENDING_REVIEW', 'REJECTED'],
          default: 'APPROVED',
        },

        // قرار المريض بشأن قبول أو رفض البديل المقترح
        patientDecision: {
          type: String,
          enum: ['ACCEPTED', 'REJECTED', 'PENDING'],
          default: 'ACCEPTED',
        },
      },
    ],
    warningsFound: [
      {
        severity: { type: String },
        message: { type: String },
      },
    ],
    paymentMethod: {
      type: String,
      enum: ['CASH_ON_DELIVERY', 'CARD'],
      default: 'CASH_ON_DELIVERY',
    },
    orderedAt: { type: Date },
    status: {
      type: String,
      enum: [
        'PENDING',                   // قيد الاستخراج بالذكاء الاصطناعي
        'PENDING_PHARMACIST_REVIEW', // تحول للصيدلي للمراجعة والتعديل
        'READY_FOR_CART',            // مجهزة ومصادق عليها وفي انتظار الشراء
        'ORDER_PENDING',             // تم طلب الأوردر وفي انتظار التجهيز
        'ORDER_PROCESSING',          // خرج للسيارة/المندوب وفي الطريق
        'ORDER_COMPLETED',           // اكتمل وتسلم الفلوس
        'CANCELLED',                 // ملغاة
      ],
      default: 'PENDING',
    },
    totalAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Prescription = mongoose.model('Prescription', prescriptionSchema);
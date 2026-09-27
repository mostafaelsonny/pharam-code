import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type AppDispatch, type RootState } from '../../../store';
import {
  checkPrescriptionStatusThunk,
  checkoutPrescriptionThunk,
} from '../../../store/prescriptionSlice';
import { checkoutSchema, type CheckoutFormValues } from '../schemas/checkoutSchema';
import {
  getActiveDeliveryRepsAPI,
  createStripeCheckoutSessionAPI,
  type PharmacistUser,
} from '../services/prescriptionService';
import {
  ShoppingBag,
  CreditCard,
  Banknote,
  User,
  Smartphone,
  MapPin,
  Loader2,
  CheckCircle,
  Pill,
  ArrowRight,
  ShieldCheck,
  Truck,
} from 'lucide-react';




export const CheckoutPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { currentPrescription, isLoading, error } = useSelector(
    (state: RootState) => state.prescription
  );
  const { user } = useSelector((state: RootState) => state.auth);

  const [paymentMethod, setPaymentMethod] = useState<'CASH_ON_DELIVERY' | 'CARD'>('CASH_ON_DELIVERY');
  const [deliveryReps, setDeliveryReps] = useState<PharmacistUser[]>([]);
  const [isLoadingDeliveryReps, setIsLoadingDeliveryReps] = useState<boolean>(true);
  const [isProcessingCard, setIsProcessingCard] = useState<boolean>(false);
  const [cardError, setCardError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      patientName: currentPrescription?.patientName || user?.name || '',
      phone: currentPrescription?.patientInfo?.phone || '',
      address: currentPrescription?.patientInfo?.address || '',
      deliveryId: '',
      paymentMethod: 'CASH_ON_DELIVERY',
    },
  });

  useEffect(() => {
    const fetchDeliveryReps = async () => {
      try {
        setIsLoadingDeliveryReps(true);
        const reps = await getActiveDeliveryRepsAPI();
        setDeliveryReps(reps);
        if (reps.length > 0) {
          setValue('deliveryId', reps[0]._id);
        }
      } catch (err) {
        console.error('فشل في جلب قائمة مناديب التوصيل', err);
      } finally {
        setIsLoadingDeliveryReps(false);
      }
    };
    fetchDeliveryReps();
  }, [setValue]);

  useEffect(() => {
    if (id) {
      dispatch(checkPrescriptionStatusThunk(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (currentPrescription) {
      setValue('patientName', currentPrescription.patientName || user?.name || '');
      setValue('phone', currentPrescription.patientInfo?.phone || '');
      setValue('address', currentPrescription.patientInfo?.address || '');
    }
  }, [currentPrescription, user, setValue]);

  const onSubmit = async (data: CheckoutFormValues) => {
    if (!id) return;
    setCardError(null);


    if (data.paymentMethod === 'CARD') {
      try {
        setIsProcessingCard(true);
        const sessionRes = await createStripeCheckoutSessionAPI({
          prescriptionId: id,
          patientName: data.patientName,
          phone: data.phone,
          address: data.address,
          deliveryId: data.deliveryId,
          items: currentPrescription?.items,
        });

        if (sessionRes.url) {
          // التحويل المباشر إلى صفحة الدفع الآمنة من Stripe
          window.location.href = sessionRes.url;
          return;
        } else {
          setCardError('فشل في بدء جلسة الدفع عبر Stripe');
        }
      } catch (err: any) {
        console.error('Stripe session creation error:', err);
        setCardError(err.response?.data?.message || 'حدث خطأ أثناء تجهيز الدفع بالبطاقة');
      } finally {
        setIsProcessingCard(false);
      }
      return;
    }


    const res = await dispatch(
      checkoutPrescriptionThunk({
        prescriptionId: id,
        patientName: data.patientName,
        phone: data.phone,
        address: data.address,
        deliveryId: data.deliveryId,
        paymentMethod: data.paymentMethod,
        items: currentPrescription?.items,
      })
    );

    if (checkoutPrescriptionThunk.fulfilled.match(res)) {
      navigate(`/checkout/success/${id}`);
    }
  };

  if (isLoading && !currentPrescription) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-3" />
        <p className="text-sm font-bold text-slate-600">جاري تحميل تفاصيل الشراء...</p>
      </div>
    );
  }

  if (!currentPrescription) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center max-w-md mx-auto my-10 space-y-4">
        <p className="text-base font-bold text-slate-800">الروشتة غير موجودة</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
        >
          العودة للرئيسية
        </button>
      </div>
    );
  }

  const includedItems = currentPrescription.items.filter(
    (item) =>
      item.inStock &&
      item.availabilityStatus !== 'OUT_OF_STOCK' &&
      (!item.isAlternative || item.patientDecision !== 'REJECTED')
  );

  const excludedItems = currentPrescription.items.filter(
    (item) =>
      !item.inStock ||
      item.availabilityStatus === 'OUT_OF_STOCK' ||
      (item.isAlternative && item.patientDecision === 'REJECTED')
  );

  const calculatedTotal = includedItems.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 dir-rtl pb-12">
      {/* Top Banner */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
            title="العودة"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">إتمام شراء الروشتة</h1>
            <p className="text-xs text-slate-500">
              تأكيد بيانات التسليم واختيار طريقة الدفع المناسبة
            </p>
          </div>
        </div>
        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
          روشتة معتمدة #{currentPrescription._id.slice(-6)}
        </span>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-bold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 columns: Delivery details & Payment methods */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Shipping Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
              <MapPin className="w-5 h-5 text-emerald-600" />
              بيانات التسليم والمستلم
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  اسم المستلم بالكامل *
                </label>
                <div className="relative flex items-center">
                  <User className="absolute right-3.5 text-slate-400 w-4 h-4" />
                  <input
                    {...register('patientName')}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 pr-10 pl-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
                {errors.patientName && (
                  <span className="text-xs text-rose-500 font-bold mt-1 block">
                    {errors.patientName.message}
                  </span>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  رقم الهاتف والتواصل *
                </label>
                <div className="relative flex items-center">
                  <Smartphone className="absolute right-3.5 text-slate-400 w-4 h-4" />
                  <input
                    {...register('phone')}
                    dir="ltr"
                    className="w-full text-right bg-slate-50 border border-slate-200 text-slate-900 pr-10 pl-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
                {errors.phone && (
                  <span className="text-xs text-rose-500 font-bold mt-1 block">
                    {errors.phone.message}
                  </span>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  عنوان التوصيل بالتفصيل *
                </label>
                <div className="relative flex items-start">
                  <MapPin className="absolute right-3.5 top-3 text-slate-400 w-4 h-4" />
                  <textarea
                    {...register('address')}
                    rows={2}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 pr-10 pl-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-500 transition resize-none"
                  />
                </div>
                {errors.address && (
                  <span className="text-xs text-rose-500 font-bold mt-1 block">
                    {errors.address.message}
                  </span>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  اختيار مندوب التوصيل المسؤول *
                </label>
                <div className="relative flex items-center">
                  <Truck className="absolute right-3.5 text-slate-400 w-4 h-4" />
                  <select
                    {...register('deliveryId')}
                    disabled={isLoadingDeliveryReps}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 pr-10 pl-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-500 transition appearance-none cursor-pointer"
                  >
                    <option value="">-- اختر مندوب التوصيل الذي تريده --</option>
                    {deliveryReps.map((rep) => (
                      <option key={rep._id} value={rep._id}>
                        الكابتن: {rep.name}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.deliveryId && (
                  <span className="text-xs text-rose-500 font-bold mt-1 block">
                    {errors.deliveryId.message}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Payment Methods Selection */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
              <Banknote className="w-5 h-5 text-emerald-600" />
              طريقة الدفع
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: Cash on Delivery */}
              <label
                onClick={() => {
                  setPaymentMethod('CASH_ON_DELIVERY');
                  setValue('paymentMethod', 'CASH_ON_DELIVERY');
                }}
                className={`cursor-pointer p-4 rounded-2xl border-2 transition flex items-start gap-3 ${
                  paymentMethod === 'CASH_ON_DELIVERY'
                    ? 'border-emerald-600 bg-emerald-50/50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  {...register('paymentMethod')}
                  value="CASH_ON_DELIVERY"
                  checked={paymentMethod === 'CASH_ON_DELIVERY'}
                  onChange={() => {}}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Banknote className="w-5 h-5 text-emerald-600" />
                    <span className="font-bold text-slate-900 text-sm">الدفع عند الاستلام (Cash)</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    ادفع نقداً لمندوب الشحن عند استلام الأدوية والتأكد منها.
                  </p>
                </div>
              </label>

              {/* Option 2: Online Card Payment */}
              <label
                onClick={() => {
                  setPaymentMethod('CARD');
                  setValue('paymentMethod', 'CARD');
                }}
                className={`cursor-pointer p-4 rounded-2xl border-2 transition flex items-start gap-3 relative ${
                  paymentMethod === 'CARD'
                    ? 'border-emerald-600 bg-emerald-50/50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  {...register('paymentMethod')}
                  value="CARD"
                  checked={paymentMethod === 'CARD'}
                  onChange={() => {}}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CreditCard className="w-5 h-5 text-indigo-600" />
                    <span className="font-bold text-slate-900 text-sm">الدفع الإلكتروني بالبطاقة (Stripe Checkout)</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    الدفع الآمن والسهل عبر بطاقات Visa / MasterCard بواسطة بوابة دفع Stripe.
                  </p>
                </div>
              </label>
            </div>

            {paymentMethod === 'CARD' && (
              <div className="p-3 bg-indigo-50/80 border border-indigo-200 rounded-xl text-xs text-indigo-900 font-medium space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-indigo-800">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  <span>دفع آمن ومباشر عبر Stripe</span>
                </div>
                <p className="text-[11px] text-indigo-700 leading-relaxed">
                  عند الضغط على تأكيد الطلب، سيتم توجيهك بأمان إلى صفحة الدفع الرسمية الخاصة بـ Stripe لإتمام الدفع بالبطاقة الائتمانية التجريبية أو الحقيقية، ثم إعادتك لتأكيد الطلب.
                </p>
              </div>
            )}

            {cardError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium">
                {cardError}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Order Summary */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 sticky top-24">
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
              <Pill className="w-5 h-5 text-emerald-600" />
              ملخص الأدوية المشمولة بالشراء ({includedItems.length})
            </h2>

            {includedItems.length === 0 ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-bold text-center">
                لا توجد أدوية مشمولة في طلب الشراء حالياً.
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {includedItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <div>
                      <span className="font-bold text-slate-800 block">{item.drugName}</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[10px] text-slate-500">الكمية: {item.quantity}</span>
                        {item.isAlternative && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                            بديل مقبول
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="font-bold text-slate-900">{item.price * item.quantity} ج.م</span>
                  </div>
                ))}
              </div>
            )}

            {/* الأصناف المستبعدة إن وُجدت */}
            {excludedItems.length > 0 && (
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                <span className="text-xs font-bold text-slate-600 block">
                  أصناف غير مشمولة في الشحنة ({excludedItems.length}):
                </span>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {excludedItems.map((ex, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-[11px] p-2 bg-white rounded-lg border border-slate-200"
                    >
                      <span className="font-medium text-slate-700">{ex.drugName}</span>
                      {ex.isAlternative && ex.patientDecision === 'REJECTED' ? (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          بديل رفضته
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                          غير متوفر بالمخزن
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-slate-100 pt-4 space-y-2 text-xs font-semibold text-slate-600">
              <div className="flex justify-between">
                <span>إجمالي الأدوية:</span>
                <span className="font-bold text-slate-900">{calculatedTotal} ج.م</span>
              </div>
              <div className="flex justify-between">
                <span>مصاريف التوصيل:</span>
                <span className="font-bold text-emerald-600">مجاناً (عرض خاص)</span>
              </div>
              <div className="border-t border-slate-200 pt-3 flex justify-between text-sm font-extrabold text-slate-900">
                <span>الإجمالي الصافي:</span>
                <span className="text-emerald-700 text-lg">{calculatedTotal} ج.م</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || isProcessingCard || includedItems.length === 0}
              className={`w-full py-3.5 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50 ${
                paymentMethod === 'CARD'
                  ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
              }`}
            >
              {isLoading || isProcessingCard ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : paymentMethod === 'CARD' ? (
                <CreditCard className="w-5 h-5" />
              ) : (
                <CheckCircle className="w-5 h-5" />
              )}
              <span>
                {isProcessingCard
                  ? 'جاري تجهيز بوابة Stripe...'
                  : isLoading
                  ? 'جاري إرسال الطلب...'
                  : paymentMethod === 'CARD'
                  ? 'المتابعة للدفع عبر Stripe'
                  : 'تأكيد وإرسال الطلب'}
              </span>
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>دفع آمن وتشفير كامل للبيانات</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
export default CheckoutPage;

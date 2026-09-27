import React, { useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { type AppDispatch, type RootState } from '../../../store';
import { checkPrescriptionStatusThunk, resetPrescriptionState } from '../../../store/prescriptionSlice';
import { verifyStripePaymentAPI } from '../services/prescriptionService';
import {
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  User,
  ArrowLeft,
  FileText,
  Sparkles,
  CreditCard,
  Banknote,
} from 'lucide-react';

export const CheckoutSuccessPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const dispatch = useDispatch<AppDispatch>();

  const { currentPrescription } = useSelector(
    (state: RootState) => state.prescription
  );

  useEffect(() => {
    const initVerification = async () => {
      if (!id) return;

      // إذا كان المستخدم عائداً من جلسة Stripe
      if (sessionId) {
        try {
          await verifyStripePaymentAPI(id, sessionId);
        } catch (err) {
          console.error('فشل في التحقق من الدفع الإلكتروني:', err);
        }
      }

      dispatch(checkPrescriptionStatusThunk(id));
    };

    initVerification();
  }, [id, sessionId, dispatch]);

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-6 dir-rtl text-center">
      {/* Top Animated Success Card */}
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden space-y-6">
        <div className="absolute top-0 left-0 w-40 h-40 bg-emerald-50 rounded-full blur-3xl pointer-events-none" />

        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-full bg-emerald-100 border-4 border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-14 h-14" />
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-7 w-7">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-7 w-7 bg-emerald-600 border-2 border-white items-center justify-center text-white text-xs">
              ✓
            </span>
          </span>
        </div>

        <div>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-extrabold rounded-full inline-flex items-center gap-1.5 mb-3 border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            تم تأكيد الطلب بنجاح
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
            شكراً لطلبك من MediScout!
          </h1>
          <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            تم استلام الطلب وبدأ الصيدلي والمندوب في التجهيز. ستحصل على إشعار بتحديث الحالة خلال 30 ثانية.
          </p>
        </div>

        {/* Order Meta Info Card */}
        {currentPrescription && (
          <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl text-right space-y-4 text-xs font-semibold text-slate-700">
            <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-3 gap-2">
              <span className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                رقم الروشتة: #{currentPrescription._id.slice(-8)}
              </span>
              <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full font-bold text-[11px] border border-amber-300">
                ⏳ قيد التجهيز (ORDER_PENDING)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <span>المستلم: <strong>{currentPrescription.patientName}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span dir="ltr">الهاتف: <strong>{currentPrescription.patientInfo?.phone}</strong></span>
              </div>
              <div className="flex items-center gap-2 sm:col-span-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span>العنوان: <strong>{currentPrescription.patientInfo?.address}</strong></span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm font-extrabold text-slate-900">
              <div className="flex items-center gap-2">
                {currentPrescription.paymentMethod === 'CARD' ? (
                  <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5" />
                    تم الدفع إلكترونياً (Stripe)
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1.5">
                    <Banknote className="w-3.5 h-3.5" />
                    الدفع عند الاستلام (Cash)
                  </span>
                )}
                <span>المبلغ الإجمالي:</span>
              </div>
              <span className="text-emerald-700 text-xl font-black">
                {currentPrescription.totalAmount} ج.م
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/prescriptions/history"
            onClick={() => dispatch(resetPrescriptionState())}
            className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
          >
            <Clock className="w-4 h-4" />
            <span>متابعة الطلب في سجل الروشتات</span>
          </Link>
          <Link
            to="/"
            onClick={() => dispatch(resetPrescriptionState())}
            className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 border border-slate-200"
          >
            <span>العودة لصفحة رفع الروشتات</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
export default CheckoutSuccessPage;

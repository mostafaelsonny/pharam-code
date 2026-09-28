import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { type RootState, type AppDispatch } from '../../../store';
import {
  checkPrescriptionStatusThunk,
  toggleAlternativeDecision,
  updatePatientDecisionsThunk,
} from '../../../store/prescriptionSlice';
import { 
  ClipboardCheck, 
  ShieldCheck, 
  Pill, 
  Syringe, 
  RefreshCw, 
  Cpu,
  Clock,
  UserCheck,
  MessageSquareText,
  ShoppingBag,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';

// ==============================================================================
// مكوّن عرض نتيجة الروشتة (PrescriptionResult)
// الوظيفة:
// 1. عرض تفاصيل الأدوية المستخرجة والتداخلات الدوائية المحتملة.
// 2. إظهار حالة الروشتة مع اسم الصيدلي المسؤول.
// 3. الاستماع للتحديثات اللحظية عبر Socket.IO و BroadcastChannel عند اعتماد الصيدلي.
// 4. تمكين المريض من قبول أو رفض البدائل (فقط بعد اعتماد الصيدلي) واحتساب الإجمالي.
// 5. التحقق من وجود دواء واحد على الأقل قبل إتاحة زر المتابعة إلى صفحة الشراء.
// ==============================================================================

export const PrescriptionResult: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { currentPrescription, warnings } = useSelector(
    (state: RootState) => state.prescription
  );
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // التحقق من حالة الروشتة عند تحميل الصفحة (للاسترداد بعد Refresh)
  // ملاحظة: الـ Socket.IO listener المسؤول عن التحديثات اللحظية
  // تم نقله إلى AuthInitializer ليكون دائماً بغض النظر عن حالة الروشتة.
  useEffect(() => {
    const id = currentPrescription?._id;
    const status = currentPrescription?.status;

    if (!id || status !== 'PENDING_PHARMACIST_REVIEW') return;

    // استعلام أولي عند تحميل الصفحة للتأكد من آخر حالة
    dispatch(checkPrescriptionStatusThunk(id));
  }, [currentPrescription?._id, currentPrescription?.status, dispatch]);

  if (!currentPrescription) {
    return (
      <div className="bg-white border border-slate-200/80 p-10 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm h-full min-h-[480px]">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <Cpu className="w-10 h-10 animate-pulse" />
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-emerald-600 border-2 border-white"></span>
          </span>
        </div>
        <h3 className="font-bold text-slate-900 text-xl mb-2">في انتظار إرسال الروشتة</h3>
        <p className="text-slate-500 text-sm max-w-md leading-relaxed">
          قم برفع صورة الروشتة واختيار الصيدلي ليتم الفحص وتجهيز الدواء فوراً.
        </p>
      </div>
    );
  }

  const isPendingReview = currentPrescription.status === 'PENDING_PHARMACIST_REVIEW';
  
  // استخراج اسم الصيدلي سواء كان كائن مع Populate أو مجرد ID
  const pharmacistName = typeof currentPrescription.pharmacistId === 'object' && currentPrescription.pharmacistId !== null
    ? (currentPrescription.pharmacistId as any).name 
    : 'الصيدلي المعتمد';

  return (
    <div className="bg-white border border-slate-200/80 p-6 sm:p-8 rounded-2xl flex flex-col gap-6 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-50 rounded-full blur-2xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-slate-900">الاستخراج والتدقيق السريري</h2>
            <span className="text-xs text-slate-500">تم فحص التفاعلات الدوائية بنجاح</span>
          </div>
        </div>
      </div>

      {/* التحذيرات إن وجدت */}
      {warnings && warnings.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 space-y-2">
          <span className="font-bold text-sm text-rose-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-rose-600" />
            تنبيه: تداخلات دوائية محتملة
          </span>
          {warnings.map((w, i) => (
            <p key={i} className="text-xs text-rose-700 font-medium bg-white/60 p-2 rounded-lg border border-rose-100">
              • {w.message || `${w.ingredientA} + ${w.ingredientB}`}
            </p>
          ))}
        </div>
      )}

      {/* Banner حالة الروشتة وإظهار اسم الصيدلي المسؤول */}
      <div className={`${isPendingReview ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50/60 border-emerald-200'} border p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-500`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl text-white flex items-center justify-center shadow-sm transition-all duration-500 ${isPendingReview ? 'bg-amber-500 shadow-amber-500/30' : 'bg-emerald-600 shadow-emerald-600/30'}`}>
            {isPendingReview ? <Clock className="w-6 h-6 animate-pulse" /> : <ShieldCheck className="w-6 h-6" />}
          </div>
          <div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 mb-1.5 w-fit border transition-all duration-500 ${isPendingReview ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-emerald-100/80 text-emerald-800 border-emerald-300/60'}`}>
              <span className={`w-2 h-2 rounded-full ${isPendingReview ? 'bg-amber-600 animate-ping' : 'bg-emerald-600'}`}></span>
              {isPendingReview ? 'قيد مراجعة الصيدلي' : 'تم الفحص والموافقة'}
            </span>
            <h3 className="font-bold text-base text-slate-900">المريض: {currentPrescription.patientName}</h3>
          </div>
        </div>

        {/* عرض اسم الصيدلي في كارت جانبي داخل الـ Banner */}
        <div className="flex items-center gap-2.5 bg-white/80 border border-slate-200/80 px-3.5 py-2 rounded-xl text-right">
          <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 leading-tight">الصيدلي المسؤول</span>
            <span className="text-xs font-bold text-slate-800 leading-tight">د. {pharmacistName}</span>
          </div>
        </div>
      </div>

      {/* قائمة الأدوية */}
      <div className="flex flex-col gap-3">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 mb-1">
          <Pill className="w-5 h-5 text-emerald-600" />
          <span>الأدوية المستخرجة ({currentPrescription.items.length} أصناف)</span>
        </h3>

        {currentPrescription.items.map((item, idx) => {
          const isAlternativeRejected = item.isAlternative && item.patientDecision === 'REJECTED';
          const isOutOfStock = item.availabilityStatus === 'OUT_OF_STOCK';

          return (
            <div
              key={idx}
              className={`border p-4 rounded-2xl flex flex-col gap-3 shadow-sm transition-all ${
                isAlternativeRejected
                  ? 'bg-slate-50/70 border-slate-200 opacity-80'
                  : isOutOfStock
                  ? 'bg-rose-50/30 border-rose-200'
                  : item.isAlternative
                  ? 'bg-amber-50/40 border-amber-200'
                  : 'bg-white border-slate-200/90'
              }`}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                      isAlternativeRejected
                        ? 'bg-slate-100 border-slate-200 text-slate-400'
                        : isOutOfStock
                        ? 'bg-rose-100 border-rose-200 text-rose-600'
                        : item.isAlternative
                        ? 'bg-amber-100 border-amber-200 text-amber-700'
                        : 'bg-emerald-50 border-emerald-200/70 text-emerald-700'
                    }`}
                  >
                    <Syringe className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h4
                        className={`font-bold text-sm sm:text-base ${
                          isAlternativeRejected ? 'line-through text-slate-500' : 'text-slate-900'
                        }`}
                      >
                        {item.drugName}
                      </h4>
                      {item.availabilityStatus === 'AVAILABLE' && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                          متوفر الأصلي
                        </span>
                      )}
                      {item.isAlternative && (
                        <span
                          className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${
                            isPendingReview
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : isAlternativeRejected
                              ? 'bg-slate-100 text-slate-600 border-slate-300'
                              : 'bg-amber-100 text-amber-800 border-amber-300'
                          }`}
                        >
                          {isPendingReview
                            ? 'بديل مقترح (قيد مراجعة الصيدلي)'
                            : isAlternativeRejected
                            ? 'بديل تم رفضه'
                            : 'بديل معتمد ومقبول'}
                        </span>
                      )}
                      {isOutOfStock && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold">
                          غير متوفر في المخزن
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 font-medium">
                      المادة الفعالة: {item.activeIngredient}
                    </span>
                    <span className="text-xs text-slate-700 font-semibold mt-1 bg-slate-100 px-2 py-1 rounded w-fit">
                      الجرعة: {item.dosage}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="text-right md:text-left">
                    {isAlternativeRejected ? (
                      <div>
                        <span className="text-xs font-bold text-slate-400 line-through block">
                          {item.price} ج.م
                        </span>
                        <span className="text-[10px] font-bold text-rose-600 block">
                          مستبعد من الشراء
                        </span>
                      </div>
                    ) : isOutOfStock ? (
                      <div>
                        <span className="text-xs font-bold text-slate-400 block">غير متوفر</span>
                        <span className="text-[10px] font-bold text-slate-400 block">
                          غير مشمول بالفاتورة
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span className="font-bold text-base text-slate-900 block">
                          {item.price} ج.م
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 block">
                          مشمول في الشراء
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ملاحظات الصيدلي */}
              {item.pharmacistNotes && (
                <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/70 flex items-start gap-2.5">
                  <MessageSquareText className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-emerald-900 font-medium">
                    <strong className="font-bold text-emerald-800">ملاحظة الصيدلي:</strong>{' '}
                    {item.pharmacistNotes}
                  </p>
                </div>
              )}

              {/* كارت قرار المريض في حالة البديل */}
              {item.isAlternative && (
                <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <RefreshCw className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-amber-950">
                        دواء بديل للدواء الأصلي:{' '}
                        <strong className="text-amber-800">
                          {item.suggestedAlternativeFor || 'غير محدد'}
                        </strong>
                      </p>
                      <span className="text-[11px] text-amber-800 font-medium block mt-0.5">
                        {isPendingReview
                          ? '⏳ هذا العلاج مقترح كبديل من الذكاء الاصطناعي أو النظام وهو قيد مراجعة وتدقيق الصيدلي حالياً. ستتمكن من الموافقة عليه أو رفضه فور اعتماد الصيدلي.'
                          : isAlternativeRejected
                          ? '❌ اخترت عدم شراء هذا البديل (لن يتم تضمينه في الفاتورة أو الشحنة)'
                          : '✔️ وافقت على شراء هذا البديل وسيتضمنه طلبك والفاتورة'}
                      </span>
                    </div>
                  </div>

                  {/* أزرار اتخاذ القرار متاحة فقط بعد انتهاء الصيدلي من المراجعة والاعتماد */}
                  {!isPendingReview && (
                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          dispatch(
                            toggleAlternativeDecision({
                              drugName: item.drugName,
                              decision: 'ACCEPTED',
                            })
                          );
                          if (currentPrescription._id) {
                            const updated = currentPrescription.items.map((it) =>
                              it.drugName === item.drugName ? { ...it, patientDecision: 'ACCEPTED' as const } : it
                            );
                            dispatch(
                              updatePatientDecisionsThunk({
                                prescriptionId: currentPrescription._id,
                                items: updated,
                              })
                            );
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          !isAlternativeRejected
                            ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/30'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>موافق على البديل</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          dispatch(
                            toggleAlternativeDecision({
                              drugName: item.drugName,
                              decision: 'REJECTED',
                            })
                          );
                          if (currentPrescription._id) {
                            const updated = currentPrescription.items.map((it) =>
                              it.drugName === item.drugName ? { ...it, patientDecision: 'REJECTED' as const } : it
                            );
                            dispatch(
                              updatePatientDecisionsThunk({
                                prescriptionId: currentPrescription._id,
                                items: updated,
                              })
                            );
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          isAlternativeRejected
                            ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-600/30'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>رفض البديل</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* الملخص المالي */}
      <div className="bg-slate-50 border border-slate-200/90 p-5 rounded-2xl flex items-center justify-between shadow-sm mt-2">
        <div>
          <span className="font-bold text-base text-slate-900 block">الإجمالي النهائي</span>
          <span className="text-xs text-slate-500">مجموع الأدوية المعتمدة والمعالجة</span>
        </div>
        <div className="text-left">
          <span className="font-extrabold text-2xl text-emerald-700 block leading-none">{currentPrescription.totalAmount} ج.م</span>
        </div>
      </div>

      {!isPendingReview && (
        <>
          {(() => {
            const hasPurchasableItems = currentPrescription.items.some(
              (item) =>
                item.inStock &&
                item.availabilityStatus !== 'OUT_OF_STOCK' &&
                (!item.isAlternative || item.patientDecision !== 'REJECTED')
            );

            if (!hasPurchasableItems) {
              return (
                <div className="mt-2 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <span className="font-bold block text-sm mb-0.5">لا توجد أدوية متاحة للشراء</span>
                    <span>
                      جميع الأدوية في هذه الروشتة غير متوفرة في المخزن أو تم رفض البدائل المقترحة لها. لا يمكن إتمام عملية الشراء إلا بوجود دواء واحد على الأقل للشراء.
                    </span>
                  </div>
                </div>
              );
            }

            return (
              <button
                onClick={() => {
                  if (isAuthenticated) {
                    navigate(`/checkout/${currentPrescription._id}`);
                  } else {
                    navigate(`/login?redirect=/checkout/${currentPrescription._id}`);
                  }
                }}
                className="w-full mt-2 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer animate-bounce"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>المتابعة إلى صفحة الشراء وإتمام الطلب</span>
              </button>
            );
          })()}
        </>
      )}
    </div>
  );
};
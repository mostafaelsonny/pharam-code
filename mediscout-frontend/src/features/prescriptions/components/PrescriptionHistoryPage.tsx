import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { type AppDispatch, type RootState } from '../../../store';
import { fetchUserPrescriptionsThunk } from '../../../store/prescriptionSlice';
import { type Prescription } from '../../../types';
import { socketService } from '../../../services/socketService';
import {
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  Pill,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  RefreshCw,
  FileText,
  Calendar,
  MapPin,
  Phone,
  Banknote,
  CreditCard,
  UserCheck,
  Loader2,
} from 'lucide-react';

export const PrescriptionHistoryPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { userPrescriptions, isLoading } = useSelector(
    (state: RootState) => state.prescription
  );
  const { user } = useSelector((state: RootState) => state.auth);

  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchUserPrescriptionsThunk());

    const socket = socketService.getSocket();
    if (user?._id) {
      socketService.joinUserRoom(user._id, user.role);
    }

    const handleStatusUpdate = (eventData: any) => {
      if (!eventData?.userId || eventData.userId === user?._id) {
        dispatch(fetchUserPrescriptionsThunk());
      }
    };

    socket.on('prescription:status_updated', handleStatusUpdate);

    return () => {
      socket.off('prescription:status_updated', handleStatusUpdate);
    };
  }, [dispatch, user?._id, user?.role]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const filteredPrescriptions = (userPrescriptions || []).filter((p) => {
    if (activeTab === 'ACTIVE') {
      return p.status === 'ORDER_PENDING' || p.status === 'ORDER_PROCESSING' || p.status === 'READY_FOR_CART';
    }
    if (activeTab === 'COMPLETED') {
      return p.status === 'ORDER_COMPLETED';
    }
    if (activeTab === 'CANCELLED') {
      return p.status === 'CANCELLED';
    }
    return true;
  });

  const getStatusBadge = (status: Prescription['status']) => {
    switch (status) {
      case 'ORDER_PENDING':
        return (
          <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-300 text-xs font-bold rounded-full flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            قيد التجهيز (ORDER_PENDING)
          </span>
        );
      case 'ORDER_PROCESSING':
        return (
          <span className="px-3 py-1 bg-sky-50 text-sky-800 border border-sky-300 text-xs font-bold rounded-full flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-sky-600 animate-bounce" />
            في الطريق إليك (ORDER_PROCESSING)
          </span>
        );
      case 'ORDER_COMPLETED':
        return (
          <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-full flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            تم التسليم بنجاح (ORDER_COMPLETED)
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-3 py-1 bg-rose-50 text-rose-800 border border-rose-300 text-xs font-bold rounded-full flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            تم الإلغاء (CANCELLED)
          </span>
        );
      case 'READY_FOR_CART':
        return (
          <span className="px-3 py-1 bg-indigo-50 text-indigo-800 border border-indigo-300 text-xs font-bold rounded-full flex items-center gap-1.5">
            <ShoppingBag className="w-3.5 h-3.5 text-indigo-600" />
            معتمدة وفي انتظار الشراء
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 dir-rtl pb-12">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">سجل الروشتات والطلبات</h1>
            <p className="text-xs text-slate-500">
              متابعة حالة الروشتات المطلوبة وحالة الشحن والتسليم لحظياً
            </p>
          </div>
        </div>

        <button
          onClick={() => dispatch(fetchUserPrescriptionsThunk())}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>تحديث الحالات</span>
        </button>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
            activeTab === 'ALL'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          جميع الطلبات ({(userPrescriptions || []).length})
        </button>
        <button
          onClick={() => setActiveTab('ACTIVE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
            activeTab === 'ACTIVE'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          الطلبات الجارية (
          {(userPrescriptions || []).filter(
            (p) => p.status === 'ORDER_PENDING' || p.status === 'ORDER_PROCESSING' || p.status === 'READY_FOR_CART'
          ).length}
          )
        </button>
        <button
          onClick={() => setActiveTab('COMPLETED')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
            activeTab === 'COMPLETED'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          المكتملة (
          {(userPrescriptions || []).filter((p) => p.status === 'ORDER_COMPLETED').length}
          )
        </button>
        <button
          onClick={() => setActiveTab('CANCELLED')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
            activeTab === 'CANCELLED'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          الملغاة (
          {(userPrescriptions || []).filter((p) => p.status === 'CANCELLED').length}
          )
        </button>
      </div>

      {/* Main List */}
      {isLoading && (!userPrescriptions || userPrescriptions.length === 0) ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-500">جاري جلب سجل الروشتات...</p>
        </div>
      ) : filteredPrescriptions.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">لا توجد روشتات في هذا القسم</h3>
          <p className="text-xs text-slate-500">
            يمكنك رفع روشتة جديدة والحصول على الدواء المعتمد بسهولة.
          </p>
          <Link
            to="/"
            className="inline-block px-5 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition"
          >
            رفع روشتة جديدة
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPrescriptions.map((prescription) => {
            const isExpanded = expandedId === prescription._id;
            const pharmacistName =
              typeof prescription.pharmacistId === 'object' && prescription.pharmacistId !== null
                ? (prescription.pharmacistId as any).name
                : 'الصيدلي المعتمد';

            return (
              <div
                key={prescription._id}
                className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all"
              >
                {/* Header Row */}
                <div
                  onClick={() => toggleExpand(prescription._id)}
                  className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 transition border-b border-slate-100"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-extrabold text-xs">
                      #{prescription._id.slice(-5)}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-900 text-base">
                          الروشتة: {prescription.patientName}
                        </h3>
                        {getStatusBadge(prescription.status)}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {prescription.createdAt
                            ? new Date(prescription.createdAt).toLocaleDateString('ar-EG', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : ''}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-700 font-semibold">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                          د. {pharmacistName}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                    <div className="text-right sm:text-left">
                      <span className="text-[10px] text-slate-400 block font-bold">الإجمالي</span>
                      <span className="text-base font-extrabold text-emerald-700">
                        {prescription.totalAmount} ج.م
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {prescription.status === 'READY_FOR_CART' && (
                        <Link
                          to={`/checkout/${prescription._id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-sm"
                        >
                          إتمام الشراء
                        </Link>
                      )}
                      <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-6 bg-slate-50/50 space-y-4 text-xs font-semibold text-slate-700">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                        <span dir="ltr">الهاتف: <strong>{prescription.patientInfo?.phone}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>العنوان: <strong>{prescription.patientInfo?.address}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        {prescription.paymentMethod === 'CARD' ? (
                          <CreditCard className="w-4 h-4 text-indigo-600 shrink-0" />
                        ) : (
                          <Banknote className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                        <span>
                          طريقة الدفع:{' '}
                          <strong>
                            {prescription.paymentMethod === 'CARD' ? 'بطاقة ائتمان' : 'الدفع عند الاستلام (Cash)'}
                          </strong>
                        </span>
                      </div>
                    </div>

                    {prescription.status === 'CANCELLED' && prescription.cancellationReason && (
                      <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-rose-800">
                        <strong className="block text-sm font-bold mb-1 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          سبب الإلغاء:
                        </strong>
                        <p className="text-xs font-medium leading-relaxed">{prescription.cancellationReason}</p>
                      </div>
                    )}

                    {/* Items Table */}
                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        <Pill className="w-4 h-4 text-emerald-600" />
                        الأدوية المشمولة بالروشتة ({prescription.items.length})
                      </h4>

                      <div className="space-y-2">
                        {prescription.items.map((item, idx) => {
                          const isRejected = item.isAlternative && item.patientDecision === 'REJECTED';
                          const isOutOfStock = item.availabilityStatus === 'OUT_OF_STOCK' || !item.inStock;

                          return (
                            <div
                              key={idx}
                              className={`p-3 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                                isRejected
                                  ? 'bg-slate-50 border-slate-200/90 opacity-75'
                                  : isOutOfStock
                                  ? 'bg-rose-50/30 border-rose-200'
                                  : 'bg-white border-slate-200'
                              }`}
                            >
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span
                                    className={`font-bold ${
                                      isRejected || isOutOfStock ? 'text-slate-600' : 'text-slate-900'
                                    }`}
                                  >
                                    {item.drugName}
                                  </span>

                                  {isRejected ? (
                                    <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[10px] font-bold rounded-full border border-rose-200">
                                      بديل تم رفضه من قِبلك
                                    </span>
                                  ) : isOutOfStock ? (
                                    <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold rounded-full border border-rose-200">
                                      غير متوفر في مخزننا
                                    </span>
                                  ) : item.isAlternative ? (
                                    <span className="px-2 py-0.5 bg-amber-50 text-amber-800 text-[10px] font-bold rounded-full border border-amber-200">
                                      بديل مقبول لـ: {item.suggestedAlternativeFor}
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200">
                                      مشمول في الشحنة
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] text-slate-500 block mt-0.5">
                                  المادة الفعالة: {item.activeIngredient} | الجرعة: {item.dosage}
                                </span>
                              </div>

                              <div className="text-right sm:text-left">
                                {isRejected ? (
                                  <div>
                                    <span className="text-xs font-bold text-rose-600 block">
                                      مرفوض من المريض
                                    </span>
                                    <span className="text-[10px] text-slate-400 block">
                                      (لم يُدرج بالشحنة)
                                    </span>
                                  </div>
                                ) : isOutOfStock ? (
                                  <div>
                                    <span className="text-xs font-bold text-slate-500 block">
                                      غير متوفر بالمخزن
                                    </span>
                                    <span className="text-[10px] text-slate-400 block">
                                      (لم يُشحن مع الطلب)
                                    </span>
                                  </div>
                                ) : (
                                  <div>
                                    <span className="text-xs font-extrabold text-slate-900 block">
                                      {item.price * item.quantity} ج.م
                                    </span>
                                    <span className="text-[10px] text-slate-500 block">
                                      (الكمية: {item.quantity})
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default PrescriptionHistoryPage;

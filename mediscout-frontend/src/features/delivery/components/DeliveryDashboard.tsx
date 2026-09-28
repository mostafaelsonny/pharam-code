import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { type AppDispatch, type RootState } from '../../../store';
import {
  fetchDeliveryPrescriptionsThunk,
  updateDeliveryStatusThunk,
} from '../../../store/prescriptionSlice';
import { socketService } from '../../../services/socketService';
import {
  Truck,
  PackageCheck,
  Clock,
  XCircle,
  CheckCircle2,
  RefreshCw,
  Phone,
  MapPin,
  User,
  Banknote,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Pill,
  Loader2,
} from 'lucide-react';
import { ConfirmModal } from '../../../components/common/ConfirmModal';

// ==============================================================================
// لوحة تحكم مندوب التوصيل (DeliveryDashboard)
// الوظيفة:
// 1. عرض طلبات التوصيل المسندة للمندوب الحالي والمصنفة (معلقة، قيد التوصيل، مكتملة).
// 2. الاستماع الفوري للطلبات الجديدة عبر Socket.IO وتشغيل نغمة تنبيه صوتية.
// 3. تمكين المندوب من تحديث حالة الطلب يدوياً باستخدام مودل تأكيد أنيق (ConfirmModal).
// 4. إظهار تفاصيل الأصناف المشمولة بالتحصيل والتسليم بوضوح وتفادي النواقص.
// ==============================================================================

export const DeliveryDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { deliveryPrescriptions, isLoading } = useSelector(
    (state: RootState) => state.prescription
  );
  const { user } = useSelector((state: RootState) => state.auth);

  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'PROCESSING' | 'COMPLETED'>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification.mp3');
      audio.play().catch(() => {});
    } catch (e) {
      // Ignore audio autoplay restrictions
    }
  };

  useEffect(() => {
    dispatch(fetchDeliveryPrescriptionsThunk());

    const socket = socketService.getSocket();
    if (user?._id) {
      socketService.joinUserRoom(user._id, user.role);
    }

    const handleDeliveryEvent = (eventData: any) => {
      if (!eventData?.deliveryId || eventData.deliveryId === user?._id) {
        playNotificationSound();
        dispatch(fetchDeliveryPrescriptionsThunk());
      }
    };

    socket.on('delivery:new_order', handleDeliveryEvent);
    socket.on('prescription:status_updated', handleDeliveryEvent);

    return () => {
      socket.off('delivery:new_order', handleDeliveryEvent);
      socket.off('prescription:status_updated', handleDeliveryEvent);
    };
  }, [dispatch, user?._id, user?.role]);

  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    prescriptionId: string;
    status: 'ORDER_PROCESSING' | 'ORDER_COMPLETED' | 'CANCELLED';
    title: string;
    message: string;
    type: 'warning' | 'danger' | 'info';
    cancelReason: string;
  }>({
    isOpen: false,
    prescriptionId: '',
    status: 'ORDER_PROCESSING',
    title: '',
    message: '',
    type: 'info',
    cancelReason: '',
  });

  const handleStatusUpdate = (
    prescriptionId: string,
    status: 'ORDER_PROCESSING' | 'ORDER_COMPLETED' | 'CANCELLED'
  ) => {
    let title = 'تغيير حالة الطلب';
    let message = `هل أنت متأكد من تغيير حالة الطلب؟`;
    let type: 'warning' | 'danger' | 'info' = 'info';

    if (status === 'ORDER_PROCESSING') {
      title = 'بدء توصيل الطلب';
      message = 'هل أنت متأكد من استلام وتجهيز الطلب وتحويله إلى "جاري التوصيل"؟ سيصل إشعار للمريض بذلك.';
      type = 'info';
    } else if (status === 'ORDER_COMPLETED') {
      title = 'تأكيد تسليم الطلب';
      message = 'هل تم تسليم الأدوية للمريض وتحصيل المبلغ بنجاح؟ سيتم إغلاق الطلب نهائياً كـ "مكتمل".';
      type = 'warning';
    } else if (status === 'CANCELLED') {
      title = 'إلغاء الطلب';
      message = 'يرجى كتابة سبب الإلغاء بوضوح ليتم تسجيله في النظام وإبلاغ المريض به:';
      type = 'danger';
    }

    setStatusModal({
      isOpen: true,
      prescriptionId,
      status,
      title,
      message,
      type,
      cancelReason: '',
    });
  };

  const confirmStatusUpdate = async () => {
    const { prescriptionId, status, cancelReason } = statusModal;
    
    if (status === 'CANCELLED' && !cancelReason.trim()) {
      alert('يرجى إدخال سبب الإلغاء');
      return;
    }
    
    setStatusModal((prev) => ({ ...prev, isOpen: false }));
    await dispatch(updateDeliveryStatusThunk({ prescriptionId, status, cancelReason }));
    dispatch(fetchDeliveryPrescriptionsThunk());
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const filteredOrders = deliveryPrescriptions.filter((order) => {
    if (activeTab === 'PENDING') return order.status === 'ORDER_PENDING';
    if (activeTab === 'PROCESSING') return order.status === 'ORDER_PROCESSING';
    if (activeTab === 'COMPLETED') return order.status === 'ORDER_COMPLETED';
    return true;
  });

  const pendingCount = deliveryPrescriptions.filter((o) => o.status === 'ORDER_PENDING').length;
  const processingCount = deliveryPrescriptions.filter((o) => o.status === 'ORDER_PROCESSING').length;
  const completedCount = deliveryPrescriptions.filter((o) => o.status === 'ORDER_COMPLETED').length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 dir-rtl pb-12">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">لوحة تحكم مندوب التوصيل</h1>
            <p className="text-xs text-slate-500">
              متابعة الطلبات المسندة إليك وتحديث حالة التوصيل والتسليم لحظياً
            </p>
          </div>
        </div>

        <button
          onClick={() => dispatch(fetchDeliveryPrescriptionsThunk())}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>تحديث القائمة</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 block mb-1">في انتظار التوصيل</span>
            <span className="text-2xl font-black text-amber-600">{pendingCount} طلب</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 block mb-1">جاري التوصيل حالياً</span>
            <span className="text-2xl font-black text-sky-600">{processingCount} طلب</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Truck className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 block mb-1">الطلبات المكتملة</span>
            <span className="text-2xl font-black text-emerald-600">{completedCount} طلب</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <PackageCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
            activeTab === 'ALL'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          كافة الطلبات ({deliveryPrescriptions.length})
        </button>
        <button
          onClick={() => setActiveTab('PENDING')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
            activeTab === 'PENDING'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          في انتظارك ({pendingCount})
        </button>
        <button
          onClick={() => setActiveTab('PROCESSING')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
            activeTab === 'PROCESSING'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          جاري التوصيل ({processingCount})
        </button>
        <button
          onClick={() => setActiveTab('COMPLETED')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
            activeTab === 'COMPLETED'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          مكتملة ({completedCount})
        </button>
      </div>

      {/* Main Queue List */}
      {isLoading && deliveryPrescriptions.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
          <Loader2 className="w-8 h-8 text-sky-600 animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-500">جاري جلب الطلبات المسندة...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-2">
          <Truck className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">لا توجد طلبات في هذا القسم</h3>
          <p className="text-xs text-slate-400">ستظهر الطلبات فور قيام المرضى باختيارك كمندوب للتوصيل.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isExpanded = expandedId === order._id;

            return (
              <div
                key={order._id}
                className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all"
              >
                {/* Order Top Bar */}
                <div
                  onClick={() => toggleExpand(order._id)}
                  className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 transition border-b border-slate-100"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center font-extrabold text-xs">
                      #{order._id.slice(-5)}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                          <User className="w-4 h-4 text-sky-600" />
                          المريض: {order.patientName}
                        </h3>

                        {order.status === 'ORDER_PENDING' && (
                          <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-full border border-amber-300">
                            ⏳ قيد التجهيز
                          </span>
                        )}
                        {order.status === 'ORDER_PROCESSING' && (
                          <span className="px-2.5 py-0.5 bg-sky-100 text-sky-800 text-[11px] font-bold rounded-full border border-sky-300">
                            🚚 في الطريق للعميل
                          </span>
                        )}
                        {order.status === 'ORDER_COMPLETED' && (
                          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full border border-emerald-300">
                            ✅ تم التسليم
                          </span>
                        )}
                        {order.status === 'CANCELLED' && (
                          <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 text-[11px] font-bold rounded-full border border-rose-300">
                            ❌ ملغي
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <strong dir="ltr">{order.patientInfo?.phone}</strong>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{order.patientInfo?.address}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Price */}
                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3">
                    <div className="text-right sm:text-left">
                      <span className="text-[10px] text-slate-400 block font-bold">المبلغ المطلوب</span>
                      <span className="text-lg font-extrabold text-emerald-700">
                        {order.totalAmount} ج.م
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {order.status === 'ORDER_PENDING' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusUpdate(order._id, 'ORDER_PROCESSING');
                          }}
                          className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-1 cursor-pointer"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>بدء التوصيل</span>
                        </button>
                      )}

                      {order.status === 'ORDER_PROCESSING' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusUpdate(order._id, 'ORDER_COMPLETED');
                          }}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>تأكيد التسليم</span>
                        </button>
                      )}

                      {order.status !== 'ORDER_COMPLETED' && order.status !== 'CANCELLED' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusUpdate(order._id, 'CANCELLED');
                          }}
                          className="px-2.5 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold rounded-xl transition border border-rose-200 cursor-pointer"
                          title="إلغاء الطلب"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
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
                        <User className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>اسم المستلم: <strong>{order.patientName}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                        <span dir="ltr">رقم الهاتف: <strong>{order.patientInfo?.phone}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        {order.paymentMethod === 'CARD' ? (
                          <CreditCard className="w-4 h-4 text-indigo-600 shrink-0" />
                        ) : (
                          <Banknote className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                        <span>
                          طريقة التحصيل:{' '}
                          <strong>
                            {order.paymentMethod === 'CARD' ? 'مدفوع إلكترونياً (Visa)' : 'كاش عند الاستلام'}
                          </strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 md:col-span-3 border-t border-slate-100 pt-2">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>عنوان التسليم التفصيلي: <strong>{order.patientInfo?.address}</strong></span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        <Pill className="w-4 h-4 text-sky-600" />
                        محتويات الأوردر للمعاينة ({order.items.length} أصناف)
                      </h4>

                      <div className="space-y-2">
                        {order.items.map((item, idx) => {
                          const isRejected = item.isAlternative && item.patientDecision === 'REJECTED';
                          const isOutOfStock = item.availabilityStatus === 'OUT_OF_STOCK' || !item.inStock;

                          return (
                            <div
                              key={idx}
                              className={`p-3 rounded-xl border flex items-center justify-between ${
                                isRejected
                                  ? 'bg-slate-50 border-slate-200 opacity-75'
                                  : isOutOfStock
                                  ? 'bg-rose-50/30 border-rose-200'
                                  : 'bg-white border-slate-200'
                              }`}
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`font-bold block ${
                                      isRejected || isOutOfStock ? 'text-slate-600' : 'text-slate-900'
                                    }`}
                                  >
                                    {item.drugName}
                                  </span>
                                  {isRejected ? (
                                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                                      بديل رفضه العميل (لا يُسلّم)
                                    </span>
                                  ) : isOutOfStock ? (
                                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                                      غير متوفر (لم يُشحن)
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                      مشمول في الشحنة للتسليم
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] text-slate-500 block mt-0.5">
                                  الجرعة: {item.dosage}
                                </span>
                              </div>
                              <div className="text-left">
                                {isRejected || isOutOfStock ? (
                                  <div>
                                    <span className="text-xs font-bold text-slate-400 block">
                                      غير مشمول بالتحصيل
                                    </span>
                                  </div>
                                ) : (
                                  <div>
                                    <span className="font-bold text-slate-900 block">
                                      {item.price * item.quantity} ج.م
                                    </span>
                                    <span className="text-[10px] text-slate-400 block">
                                      الكمية: {item.quantity}
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

      {/* Confirm Action Modal */}
      <ConfirmModal
        isOpen={statusModal.isOpen}
        title={statusModal.title}
        message={statusModal.message}
        type={statusModal.type}
        confirmText="تأكيد التغيير"
        cancelText="تراجع"
        onConfirm={confirmStatusUpdate}
        onCancel={() => setStatusModal((prev) => ({ ...prev, isOpen: false }))}
      >
        {statusModal.status === 'CANCELLED' && (
          <textarea
            value={statusModal.cancelReason}
            onChange={(e) => setStatusModal(prev => ({ ...prev, cancelReason: e.target.value }))}
            placeholder="اكتب سبب الإلغاء هنا... (مثال: العميل رفض الاستلام، العنوان خاطئ...)"
            className="w-full mt-2 p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none h-24"
            required
          />
        )}
      </ConfirmModal>
    </div>
  );
};
export default DeliveryDashboard;

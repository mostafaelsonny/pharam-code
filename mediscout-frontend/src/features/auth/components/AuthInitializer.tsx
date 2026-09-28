import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { type AppDispatch, type RootState } from "../../../store";
import {
  getProfileThunk,
  initializeAuth,
} from "../../../store/authSlice";
import {
  checkPrescriptionStatusThunk,
  fetchDeliveryPrescriptionsThunk,
  fetchPendingPrescriptionsThunk,
} from "../../../store/prescriptionSlice";
import { socketService } from "../../../services/socketService";

interface AuthInitializerProps {
  children: React.ReactNode;
}

// ==============================================================================
// AuthInitializer — مُهيِّئ الجلسة وقناة الأحداث الدائمة
// الوظيفة:
// 1. التحقق من صحة الـ token عند بدء التطبيق وجلب بيانات المستخدم.
// 2. تسجيل المستخدم في غرف Socket.IO الخاصة به فور تسجيل الدخول.
// 3. إعداد Listeners دائمة لأحداث Socket.IO (prescription + delivery)
//    على مستوى التطبيق بالكامل بدلاً من ربطها بمكوّنات قابلة للإزالة.
//    هذا يحل مشكلة الـ Production حيث تُزال الـ listeners عند تغيُّر الحالة.
// ==============================================================================

export const AuthInitializer = ({
  children,
}: AuthInitializerProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  // 1. التحقق من الجلسة عند أول تحميل للتطبيق
  useEffect(() => {
    const token = localStorage.getItem("auth_token");

    if (token) {
      dispatch(getProfileThunk());
    } else {
      dispatch(initializeAuth());
    }
  }, [dispatch]);

  // 2. الانضمام لغرف Socket.IO فور معرفة هوية المستخدم
  useEffect(() => {
    if (user?._id) {
      socketService.joinUserRoom(user._id, user.role);
    }
  }, [user]);

  // 3. Listener دائم لتحديثات الروشتة (للمريض) — لا يُزال بتغيُّر الحالة
  // يعمل حتى لو كان المريض Guest ولم يسجل الدخول
  useEffect(() => {
    // استثناء الصيدلي والمندوب والأدمن من هذا التحديث (لأنهم يتلقون تحديثاتهم الخاصة)
    if (user?.role === "pharmacist" || user?.role === "delivery" || user?.role === "admin") return;

    const socket = socketService.getSocket();

    const handlePrescriptionUpdate = (eventData: any) => {
      // الاعتماد على localStorage لتجنب الـ stale closures وتعدد الـ renders
      const activeId = localStorage.getItem("active_prescription_id");
      const targetId = eventData?.prescription?._id;

      // إذا كان الإشعار يخص الروشتة المفتوحة حالياً لدى المريض أو الـ Guest
      if (activeId && (!targetId || targetId === activeId)) {
        dispatch(checkPrescriptionStatusThunk(activeId));
      }
    };

    socket.on("prescription:status_updated", handlePrescriptionUpdate);

    return () => {
      socket.off("prescription:status_updated", handlePrescriptionUpdate);
    };
  }, [user?.role, dispatch]);

  // 4. Listener دائم لأحداث الصيدلي — يحمّل قائمة الروشتات المعلقة فوراً
  // سبب وجوده هنا: ضمان وصول إشعارات الروشتات الجديدة حتى لو
  // PharmacistDashboard غير مفتوح أو يعيد التحميل.
  useEffect(() => {
    if (!user?._id || user.role !== "pharmacist") return;

    const socket = socketService.getSocket();

    const handleNewPrescription = () => {
      dispatch(fetchPendingPrescriptionsThunk());
    };

    socket.on("prescription:new", handleNewPrescription);

    return () => {
      socket.off("prescription:new", handleNewPrescription);
    };
  }, [user?._id, user?.role, dispatch]);

  // 5. Listener دائم لأحداث التوصيل — يحمّل قائمة الطلبات فوراً
  // سبب وجوده هنا: في DeliveryDashboard كان الـ listener مرتبطاً
  // بالـ component فقط، ولا يعمل إذا كان المندوب في صفحة أخرى.
  useEffect(() => {
    if (!user?._id || user.role !== "delivery") return;

    const socket = socketService.getSocket();

    const handleDeliveryEvent = (eventData: any) => {
      if (!eventData?.deliveryId || eventData.deliveryId === user._id) {
        dispatch(fetchDeliveryPrescriptionsThunk());
      }
    };

    socket.on("delivery:new_order", handleDeliveryEvent);
    socket.on("prescription:status_updated", handleDeliveryEvent);

    return () => {
      socket.off("delivery:new_order", handleDeliveryEvent);
      socket.off("prescription:status_updated", handleDeliveryEvent);
    };
  }, [user?._id, user?.role, dispatch]);

  return children;
};

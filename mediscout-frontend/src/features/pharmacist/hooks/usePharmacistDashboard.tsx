import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store";
import {
  fetchPendingPrescriptionsThunk,
  approveByPharmacistThunk,
} from "../../../store/prescriptionSlice";
import type { Prescription, PrescriptionItem } from "../../../types";
import { socketService } from "../../../services/socketService";

export const usePharmacistDashboard = () => {
  // تمرير الـ Types المباشرة المجلوبة من الـ store
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { pendingPrescriptions, isLoading, error } = useSelector(
    (state: RootState) => state.prescription
  );

  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  // تشغيل صوت تنبيه عند وصول روشتة جديدة
  const playNotificationSound = () => {
    try {
      const audio = new Audio("/notification.mp3");
      audio.play().catch(() => {});
    } catch (e) {
      // Ignore audio autoplay restrictions
    }
  };

  const userId = user?._id;

  const loadPending = useCallback(() => {
    if (userId) {
      dispatch(fetchPendingPrescriptionsThunk(userId));
    }
  }, [dispatch, userId]);

  useEffect(() => {
    loadPending();

    const socket = socketService.getSocket();
    if (user?._id) {
      socketService.joinUserRoom(user._id, user.role);
    }

    const handleNewPrescription = (eventData: any) => {
      const targetId = eventData?.pharmacistId ? String(eventData.pharmacistId) : undefined;
      const currentUserId = user?._id ? String(user._id) : undefined;

      if (!targetId || !currentUserId || targetId === currentUserId) {
        playNotificationSound();
        loadPending();
      }
    };

    socket.on("prescription:new", handleNewPrescription);


    const channel = new BroadcastChannel("prescription_events");
    channel.onmessage = (event) => {
      const targetId = event.data?.pharmacistId ? String(event.data.pharmacistId) : undefined;
      const currentUserId = user?._id ? String(user._id) : undefined;

      if (
        event.data?.type === "NEW_PRESCRIPTION_SUBMITTED" &&
        (!targetId || !currentUserId || targetId === currentUserId)
      ) {
        playNotificationSound();
        loadPending();
      }
    };

    return () => {
      socket.off("prescription:new", handleNewPrescription);
      channel.close();
    };
  }, [loadPending, user?._id, user?.role]);

  const handleOpenReview = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setIsReviewOpen(true);
  };

  const handleCloseReview = () => {
    setSelectedPrescription(null);
    setIsReviewOpen(false);
  };

  const handleApprove = async (
    prescriptionId: string,
    updatedItems: PrescriptionItem[]
  ) => {
    const result = await dispatch(
      approveByPharmacistThunk({
        prescriptionId,
        updatedItems,
        pharmacistId: user?._id,
      })
    );

    if (approveByPharmacistThunk.fulfilled.match(result)) {
      handleCloseReview();
      loadPending();
    }
  };

  return {
    pendingPrescriptions,
    isLoading,
    error,
    selectedPrescription,
    isReviewOpen,
    handleOpenReview,
    handleCloseReview,
    handleApprove,
    refreshList: loadPending,
  };
};

// ==============================================================================
// Hook مخصص لعملية مراجعة واعتماد الروشتة (Prescription Review Action)
// الغرض: فصل مسؤولية الـ Action (الاعتماد وحالة التحميل) لتستهلكها PrescriptionReviewModal مباشرة
// لمنع الـ Prop Drilling وللحفاظ على مبدأ الـ Single Responsibility.
// ==============================================================================
export const usePharmacistReview = (onSuccess?: () => void) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { isLoading, error } = useSelector(
    (state: RootState) => state.prescription
  );

  const approvePrescription = async (
    prescriptionId: string,
    updatedItems: PrescriptionItem[]
  ) => {
    const result = await dispatch(
      approveByPharmacistThunk({
        prescriptionId,
        updatedItems,
        pharmacistId: user?._id,
      })
    );

    if (approveByPharmacistThunk.fulfilled.match(result)) {
      if (onSuccess) {
        onSuccess();
      }
      return true;
    }
    return false;
  };

  return {
    approvePrescription,
    isLoading,
    error,
  };
};
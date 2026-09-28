import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  processPrescriptionAPI,
  approveByPharmacistAPI,
  getPendingPrescriptionsAPI,
  getPrescriptionByIdAPI,
  getUserPrescriptionsAPI,
  checkoutPrescriptionAPI,
  updatePatientDecisionsAPI,
  getDeliveryPrescriptionsAPI,
  updateDeliveryStatusAPI,
  type ProcessPrescriptionPayload,
  type ProcessPrescriptionResponse,
  type ApproveByPharmacistResponse,
  type GetPrescriptionByIdResponse,
} from "../features/prescriptions/services/prescriptionService";
import {
  type Prescription,
  type PrescriptionItem,
  type Warning,
} from "../types";

interface PrescriptionState {
  currentPrescription: Prescription | null;
  pendingPrescriptions: Prescription[];
  deliveryPrescriptions: Prescription[];
  warnings: Warning[];
  selectedPharmacistId: string | null;
  isLoading: boolean;
  error: string | null;
  userPrescriptions: Prescription[] | null;
}

const initialState: PrescriptionState = {
  currentPrescription: null,
  pendingPrescriptions: [],
  deliveryPrescriptions: [],
  warnings: [],
  selectedPharmacistId: null,
  isLoading: false,
  error: null,
  userPrescriptions: null,
};



// 1- Retrieve the list of pending prescriptions assigned to the pharmacist for review and approval.
export const fetchPendingPrescriptionsThunk = createAsyncThunk<
  Prescription[],
  string | void,
  { rejectValue: string }
>("prescription/fetchPending", async (pharmacistId, { rejectWithValue }) => {
  try {
    return await getPendingPrescriptionsAPI(pharmacistId || undefined);
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "فشل جلب الروشتات المعلقة",
    );
  }
});

// 2- Sending the pharmacist's approval and sign-off regarding the prescription, modified medications, and alternatives.
export const approveByPharmacistThunk = createAsyncThunk<
  ApproveByPharmacistResponse,
  { prescriptionId: string; updatedItems?: PrescriptionItem[]; pharmacistId?: string },
  { rejectValue: string }
>(
  "prescription/pharmacistApprove",
  async ({ prescriptionId, updatedItems, pharmacistId }, { rejectWithValue }) => {
    try {
      return await approveByPharmacistAPI(prescriptionId, updatedItems, pharmacistId);
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "حدث خطأ أثناء موافقة الصيدلي",
      );
    }
  },
);

// 3- Inquire about and check the status of the patient's current prescription ...
// To monitor her condition continuously.
export const checkPrescriptionStatusThunk = createAsyncThunk<
  GetPrescriptionByIdResponse,
  string,
  { rejectValue: string }
>(
  "prescription/checkStatus",
  async (prescriptionId: string, { rejectWithValue }) => {
    try {
      return await getPrescriptionByIdAPI(prescriptionId);
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "تعذر فحص حالة الروشتة",
      );
    }
  },
);

// 4- Upload the prescription image and send it to the backend for AI analysis.
export const processPrescriptionThunk = createAsyncThunk<
  ProcessPrescriptionResponse,
  ProcessPrescriptionPayload,
  { rejectValue: string }
>(
  "prescription/process",
  async (payload: ProcessPrescriptionPayload, { rejectWithValue }) => {
    try {
      return await processPrescriptionAPI(payload);
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "حدث خطأ أثناء معالجة الروشتة",
      );
    }
  },
);

// 5- Retrieve the patient's previous orders and prescriptions record.
export const fetchUserPrescriptionsThunk = createAsyncThunk<
  Prescription[],
  void,
  { rejectValue: string }
>("prescription/fetchUserHistory", async (_, { rejectWithValue }) => {
  try {
    return await getUserPrescriptionsAPI();
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "فشل جلب سجل الروشتات للمستخدم",
    );
  }
});

// 6- تأكيد وإتمام طلب الروشتة (Checkout) ودفع الفاتورة
export const checkoutPrescriptionThunk = createAsyncThunk<
  { success: boolean; message: string; prescription: Prescription },
  {
    prescriptionId: string;
    patientName: string;
    phone: string;
    address: string;
    deliveryId?: string;
    paymentMethod: 'CASH_ON_DELIVERY' | 'CARD';
    items?: PrescriptionItem[];
  },
  { rejectValue: string }
>(
  "prescription/checkout",
  async (payload, { rejectWithValue }) => {
    try {
      return await checkoutPrescriptionAPI(payload);
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "حدث خطأ أثناء إتمام عملية الطلب",
      );
    }
  }
);

// 7- Sending and updating the patient's decisions to accept or reject alternatives to the server.
export const updatePatientDecisionsThunk = createAsyncThunk<
  Prescription,
  { prescriptionId: string; items: PrescriptionItem[] },
  { rejectValue: string }
>(
  "prescription/updatePatientDecisions",
  async ({ prescriptionId, items }, { rejectWithValue }) => {
    try {
      const res = await updatePatientDecisionsAPI(prescriptionId, items);
      return res.prescription;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "فشل تحديث قرارات المريض",
      );
    }
  }
);

// 8 -Retrieve the list of orders assigned to the delivery representative.
export const fetchDeliveryPrescriptionsThunk = createAsyncThunk<
  Prescription[],
  void,
  { rejectValue: string }
>("prescription/fetchDeliveryQueue", async (_, { rejectWithValue }) => {
  try {
    return await getDeliveryPrescriptionsAPI();
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "فشل جلب طلبات التوصيل",
    );
  }
});


// 9- Order status update by the delivery representative (start of delivery or final delivery)
export const updateDeliveryStatusThunk = createAsyncThunk<
  { success: boolean; message: string; prescription: Prescription },
  { prescriptionId: string; status: 'ORDER_PROCESSING' | 'ORDER_COMPLETED' | 'CANCELLED'; cancelReason?: string },
  { rejectValue: string }
>(
  "prescription/updateDeliveryStatus",
  async ({ prescriptionId, status, cancelReason }, { rejectWithValue }) => {
    try {
      return await updateDeliveryStatusAPI(prescriptionId, status, cancelReason);
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "حدث خطأ أثناء تحديث حالة الطلب",
      );
    }
  }
);

const prescriptionSlice = createSlice({
  name: "prescription",
  initialState,
  reducers: {
    // تحديد معرف الصيدلي المستهدف قبل إرسال الروشتة
    setSelectedPharmacist: (state, action: PayloadAction<string | null>) => {
      state.selectedPharmacistId = action.payload;
    },
    // تبديل قرار المريض (موافقة/رفض) لحظياً في واجهة المستخدم وإعادة حساب الإجمالي
    toggleAlternativeDecision: (
      state,
      action: PayloadAction<{ drugName: string; decision: 'ACCEPTED' | 'REJECTED' }>
    ) => {
      if (state.currentPrescription && state.currentPrescription.items) {
        state.currentPrescription.items = state.currentPrescription.items.map((item) => {
          if (item.drugName === action.payload.drugName && item.isAlternative) {
            return { ...item, patientDecision: action.payload.decision };
          }
          return item;
        });

        // إعادة حساب الإجمالي ديناميكياً بناءً على الأدوية المتوفرة والمقبولة فقط
        state.currentPrescription.totalAmount = state.currentPrescription.items.reduce((sum, item) => {
          const isIncluded = item.inStock && (!item.isAlternative || item.patientDecision === 'ACCEPTED');
          return sum + (isIncluded ? Number(item.price) * Number(item.quantity) : 0);
        }, 0);
      }
    },
    resetPrescriptionState: (state) => {
      localStorage.removeItem("active_prescription_id");
      state.currentPrescription = null;
      state.pendingPrescriptions = [];
      state.warnings = [];
      state.selectedPharmacistId = null;
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Process Prescription
      .addCase(processPrescriptionThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        processPrescriptionThunk.fulfilled,
        (state, action: PayloadAction<ProcessPrescriptionResponse>) => {
          state.isLoading = false;
          const prescription = action.payload.prescription || action.payload;
          state.currentPrescription = prescription;
          state.warnings =
            prescription.warningsFound || (action.payload as any).warnings || [];

          // استخراج ID الصيدلي بأمان سواء كان Object أو String
          const targetPharmacistId =
            typeof prescription.pharmacistId === "object" && prescription.pharmacistId !== null
              ? (prescription.pharmacistId as any)._id
              : prescription.pharmacistId || state.selectedPharmacistId;

          const channel = new BroadcastChannel("prescription_events");
          channel.postMessage({
            type: "NEW_PRESCRIPTION_SUBMITTED",
            pharmacistId: targetPharmacistId ? String(targetPharmacistId) : undefined,
          });
          setTimeout(() => channel.close(), 1500);

          if (prescription?._id) {
            localStorage.setItem("active_prescription_id", prescription._id);
          }
        },
      )
      .addCase(processPrescriptionThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch Pending
      .addCase(fetchPendingPrescriptionsThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPendingPrescriptionsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pendingPrescriptions = action.payload;
      })
      .addCase(fetchPendingPrescriptionsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Pharmacist Approve
      .addCase(approveByPharmacistThunk.fulfilled, (state, action) => {
        const approved = action.payload.prescription || action.payload;
        state.pendingPrescriptions = state.pendingPrescriptions.filter(
          (p) => p._id !== approved._id,
        );
        if (state.currentPrescription?._id === approved._id) {
          state.currentPrescription = approved;
          state.warnings = approved.warningsFound || state.warnings;

          const channel = new BroadcastChannel("prescription_events");
          channel.postMessage({
            type: "NEW_PRESCRIPTION_APPROVED",
            prescriptionId: approved._id,
          });
          setTimeout(() => channel.close(), 1500);
        }
      })

      // Fetch User History
      .addCase(fetchUserPrescriptionsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserPrescriptionsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userPrescriptions = action.payload;
      })
      .addCase(fetchUserPrescriptionsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Checkout
      .addCase(checkoutPrescriptionThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkoutPrescriptionThunk.fulfilled, (state) => {
        state.isLoading = false;
        localStorage.removeItem("active_prescription_id");
        state.currentPrescription = null;
        state.warnings = [];
      })
      .addCase(checkoutPrescriptionThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update Patient Decisions
      .addCase(updatePatientDecisionsThunk.fulfilled, (state, action) => {
        state.currentPrescription = action.payload;
      })

      // Check Status
      .addCase(checkPrescriptionStatusThunk.fulfilled, (state, action) => {
        const updatedPrescription =
          action.payload.prescription || action.payload;

        if (updatedPrescription && updatedPrescription._id) {
          state.currentPrescription = updatedPrescription;
          if (updatedPrescription.warningsFound) {
            state.warnings = updatedPrescription.warningsFound;
          }
        }
      })

      // Fetch Delivery Queue
      .addCase(fetchDeliveryPrescriptionsThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchDeliveryPrescriptionsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.deliveryPrescriptions = action.payload;
      })
      .addCase(fetchDeliveryPrescriptionsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update Delivery Status
      .addCase(updateDeliveryStatusThunk.fulfilled, (state, action) => {
        const updated = action.payload.prescription;
        state.deliveryPrescriptions = state.deliveryPrescriptions.map((p) =>
          p._id === updated._id ? updated : p
        );
      });
  },
});

export const {
  setSelectedPharmacist,
  toggleAlternativeDecision,
  resetPrescriptionState,
} = prescriptionSlice.actions;
export default prescriptionSlice.reducer;
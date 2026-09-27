import React from "react";
import { PharmacistStats } from "./PharmacistStats";
import { PrescriptionReviewModal } from "./PrescriptionReviewModal";
import { usePharmacistDashboard } from "../hooks/usePharmacistDashboard";
import { RefreshCw, Eye, FileText, Calendar } from "lucide-react";

export const PharmacistDashboard: React.FC = () => {
  const {
    pendingPrescriptions,
    isLoading,
    selectedPrescription,
    isReviewOpen,
    handleOpenReview,
    handleCloseReview,
    refreshList,
  } = usePharmacistDashboard();


  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">لوحة تحكم الصيدلي</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            متابعة واعتماد الروشتات المعالجة بذكاء اصطناعي
          </p>
        </div>
        <button
          onClick={refreshList}
          className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 shadow-sm transition"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          تحديث القائمة
        </button>
      </div>

      <PharmacistStats pendingCount={pendingPrescriptions.length} />

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            الروشتات المنتظرة للمراجعة
          </h2>
          <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
            {pendingPrescriptions.length} معلقة
          </span>
        </div>

        {pendingPrescriptions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText className="w-8 h-8" />
            </div>
            <p className="text-slate-500 font-medium">لا توجد روشتات معلقة حالياً</p>
            <p className="text-xs text-slate-400 mt-1">ستظهر الروشتات فور إرسالها من المرضى</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-semibold border-b border-slate-100">
                  <th className="p-4">اسم المريض</th>
                  <th className="p-4">رقم الهاتف</th>
                  <th className="p-4">عدد الأدوية</th>
                  <th className="p-4">تاريخ الطلب</th>
                  <th className="p-4 text-center">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {pendingPrescriptions.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-semibold text-slate-800">{p.patientName}</td>
                    <td className="p-4 text-slate-600" dir="ltr">{p.patientInfo.phone}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-xs font-medium">
                        {p.items?.length || 0} أدوية
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-500 flex items-center gap-1.5 mt-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {p.createdAt ? new Date(p.createdAt).toLocaleTimeString("ar-EG") : "الآن"}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleOpenReview(p)}
                        className="inline-flex items-center gap-1.5 text-xs bg-teal-50 text-teal-700 hover:bg-teal-100 px-3 py-1.5 rounded-lg font-medium transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        مراجعة واعتمد
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <PrescriptionReviewModal
        isOpen={isReviewOpen}
        prescription={selectedPrescription}
        onClose={handleCloseReview}
        onSuccess={refreshList}
      />
    </div>
  );
};
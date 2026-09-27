import React, { useState, useEffect } from "react";
import {
  X,
  Check,
  Plus,
  Trash2,
  FileText,
  User,
  Phone,
  MapPin,
  RefreshCw,
  Syringe,
  AlertCircle
} from "lucide-react";
import { type Prescription, type PrescriptionItem } from "../../../types";
import { usePharmacistReview } from "../hooks/usePharmacistDashboard";

interface PrescriptionReviewModalProps {
  isOpen: boolean;
  prescription: Prescription | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PrescriptionReviewModal: React.FC<
  PrescriptionReviewModalProps
> = ({ isOpen, prescription, onClose, onSuccess }) => {
  const [items, setItems] = useState<PrescriptionItem[]>([]);

  // استهلاك الـ Action وحالة التحميل مباشرة من الـ Hook المتخصصة
  const { approvePrescription, isLoading } = usePharmacistReview(() => {
    onClose();
    if (onSuccess) {
      onSuccess();
    }
  });

  useEffect(() => {
    if (prescription?.items) {
      setItems(prescription.items);
    }
  }, [prescription]);

  if (!isOpen || !prescription) return null;

  const handleItemChange = (
    index: number,
    field: keyof PrescriptionItem,
    value: any
  ) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };

    if (field === "isAlternative") {
      updated[index].availabilityStatus = value ? "ALTERNATIVE_AVAILABLE" : "AVAILABLE";
      if (!value) {
        updated[index].suggestedAlternativeFor = "";
      }
    }

    setItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        drugName: "",
        activeIngredient: "",
        dosage: "",
        quantity: 1,
        price: 0,
        inStock: true,
        availabilityStatus: "AVAILABLE",
        reviewStatus: "APPROVED",
        isAlternative: false,
        suggestedAlternativeFor: "",
      },
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            <h2 className="text-lg font-bold text-slate-800">
              مراجعة اعتماد الروشتة #{prescription._id?.slice(-6)}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto">
          {/* بيانات المريض وصورة الروشتة */}
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100 text-sm">
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <User className="w-4 h-4 text-teal-600" /> {prescription.patientName}
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="w-4 h-4 text-slate-400" /> {prescription.patientInfo.phone}
              </div>
              {prescription.patientInfo.address && (
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400" /> {prescription.patientInfo.address}
                </div>
              )}
            </div>

            {prescription.originalImage && (
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center min-h-[300px]">
                <img
                  src={`data:${prescription.originalImage.mimeType};base64,${prescription.originalImage.data}`}
                  alt="Prescription"
                  className="max-h-[400px] object-contain"
                />
              </div>
            )}
          </div>

          {/* قائمة الأدوية */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-slate-800">الأدوية المعتمدة للروشتة</h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs flex items-center gap-1 bg-teal-50 text-teal-700 border border-teal-200 px-3 py-1.5 rounded-lg font-medium hover:bg-teal-100 transition"
              >
                <Plus className="w-3.5 h-3.5" /> إضافة دواء بديل / جديد
              </button>
            </div>

            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
              {items.map((item, idx) => {
                // فحص إذا كان الدواء غير متوفر بالكامل
                const isOutOfStock = !item.inStock || item.availabilityStatus === "OUT_OF_STOCK";

                return (
                  <div
                    key={idx}
                    className={`border p-4 rounded-2xl flex flex-col gap-3 shadow-sm transition-all ${
                      isOutOfStock
                        ? "bg-rose-50/60 border-rose-200"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    {/* شريط معلومات الصنف العلوي */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <Syringe className={`w-4 h-4 ${isOutOfStock ? "text-rose-500" : "text-teal-600"}`} />
                        <span className="text-xs font-bold text-slate-500">دواء #{idx + 1}</span>
                        {isOutOfStock && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold">
                            غير متوفر بالمخزن
                          </span>
                        )}
                      </div>
                      
                      {/* الحذف متاح دائماً للصيدلي */}
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-rose-500 hover:text-rose-700 text-xs flex items-center gap-1 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> حذف
                      </button>
                    </div>

                    {/* إذا كان الدواء غير متوفر: عرض قراءة فقط لاسم العلاج والمادة الفعالة مع تنبيه */}
                    {isOutOfStock ? (
                      <div className="space-y-1 py-1">
                        <div className="font-bold text-slate-800 text-sm">
                          {item.drugName || "اسم دواء غير معروف"}
                        </div>
                        {item.activeIngredient && (
                          <div className="text-xs text-slate-600">
                            المادة الفعالة: <span className="font-medium text-slate-700">{item.activeIngredient}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-[11px] text-rose-600 pt-1 font-medium">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>هذا الصنف غير متوفر بالمخزن. يمكنك حذفه وإضافة دواء بديل بدلاً منه.</span>
                        </div>
                      </div>
                    ) : (
                      /* إذا كان الدواء متوفراً أو مضافاً حديثاً بواسطة الصيدلي: عرض كافة الحقول للتعديل */
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="text-[11px] font-medium text-slate-600 mb-1 block">اسم الدواء</label>
                            <input
                              type="text"
                              value={item.drugName}
                              onChange={(e) => handleItemChange(idx, "drugName", e.target.value)}
                              placeholder="اسم الدواء التجاري"
                              className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-teal-500"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-medium text-slate-600 mb-1 block">المادة الفعالة</label>
                            <input
                              type="text"
                              value={item.activeIngredient || ""}
                              onChange={(e) => handleItemChange(idx, "activeIngredient", e.target.value)}
                              placeholder="Active Ingredient"
                              className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-teal-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-[11px] font-medium text-slate-600 mb-1 block">الجرعة</label>
                            <input
                              type="text"
                              value={item.dosage || ""}
                              onChange={(e) => handleItemChange(idx, "dosage", e.target.value)}
                              placeholder="قرص كل 12 ساعة"
                              className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-teal-500"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-medium text-slate-600 mb-1 block">الكمية</label>
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) => handleItemChange(idx, "quantity", Number(e.target.value))}
                              className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-center focus:outline-none focus:border-teal-500"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-medium text-slate-600 mb-1 block">السعر (ج.م)</label>
                            <input
                              type="number"
                              min={0}
                              value={item.price || 0}
                              onChange={(e) => handleItemChange(idx, "price", Number(e.target.value))}
                              className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-center font-bold text-teal-700 focus:outline-none focus:border-teal-500"
                            />
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 space-y-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
                            <div>
                              <label className="text-[11px] font-medium text-slate-600 mb-1 block">
                                تصنيف العلاج
                              </label>
                              <select
                                value={item.isAlternative ? "ALTERNATIVE" : "ORIGINAL"}
                                onChange={(e) =>
                                  handleItemChange(idx, "isAlternative", e.target.value === "ALTERNATIVE")
                                }
                                className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-800 font-medium focus:outline-none focus:border-teal-500 cursor-pointer"
                              >
                                <option value="ORIGINAL">علاج أصلي بالروشتة</option>
                                <option value="ALTERNATIVE">علاج بديل مقترح</option>
                              </select>
                            </div>

                            {item.isAlternative && (
                              <div>
                                <label className="text-[11px] font-medium text-amber-700 mb-1 block">
                                  بديل عن أي دواء أصلي؟
                                </label>
                                <div className="relative flex items-center">
                                  <RefreshCw className="w-3.5 h-3.5 text-amber-600 absolute right-2.5 pointer-events-none" />
                                  <input
                                    type="text"
                                    value={item.suggestedAlternativeFor || ""}
                                    onChange={(e) =>
                                      handleItemChange(idx, "suggestedAlternativeFor", e.target.value)
                                    }
                                    placeholder="اسم الدواء الأصلي المستبدل"
                                    className="w-full text-xs border border-amber-300 rounded-lg pr-8 pl-2.5 py-1.5 bg-amber-50/50 text-amber-900 placeholder:text-amber-400 focus:outline-none focus:border-amber-500 font-medium"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="text-sm font-bold text-slate-700">
            الإجمالي المحسوب الأدوية المتوفرة:{" "}
            <span className="text-teal-600 text-base">
              {items
                .filter((i) => i.inStock && i.availabilityStatus !== "OUT_OF_STOCK")
                .reduce((acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0)}{" "}
              ج.م
            </span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-200 rounded-xl transition"
            >
              إلغاء
            </button>
            <button
              disabled={isLoading}
              onClick={() => approvePrescription(prescription._id, items)}
              className="px-5 py-2 text-sm bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              {isLoading ? "جاري الاعتماد..." : "اعتماد وإرسال للمريض"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
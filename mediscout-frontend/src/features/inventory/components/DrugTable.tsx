import React, { useState } from 'react';
import { type Drug } from '../../../types';
import { Edit2, Trash2, AlertTriangle, PackageCheck } from 'lucide-react';
import { ConfirmModal } from '../../../components/common/ConfirmModal';

interface DrugTableProps {
  drugs: Drug[];
  onEdit: (drug: Drug) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}

export const DrugTable: React.FC<DrugTableProps> = ({
  drugs,
  onEdit,
  onDelete,
  isLoading,
}) => {
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    drugId: string;
    drugName: string;
  }>({
    isOpen: false,
    drugId: '',
    drugName: '',
  });
  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
        جاري تحميل بيانات المخزن...
      </div>
    );
  }

  if (drugs.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 font-medium">
        لا توجد أدوية مطابقة لخيارات البحث الحالية.
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm dir-rtl">
      <div className="overflow-x-auto">
        <table className="w-full text-right text-sm text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 font-bold uppercase">
            <tr>
              <th className="p-4">الاسم التجاري</th>
              <th className="p-4">المادة الفعالة</th>
              <th className="p-4">التصنيف</th>
              <th className="p-4">الشكل</th>
              <th className="p-4">السعر</th>
              <th className="p-4">المخزون</th>
              <th className="p-4 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {drugs.map((drug) => {
              const isLowStock = drug.stockQuantity <= 10;
              return (
                <tr key={drug._id} className="hover:bg-slate-50/80 transition">
                  <td className="p-4 font-bold text-slate-900">{drug.tradeName}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {drug.activeIngredient.map((ing, i) => (
                        <span
                          key={i}
                          className="bg-slate-100 text-slate-700 text-xs font-semibold px-2 py-0.5 rounded-md"
                        >
                          {ing}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-100">
                      {drug.category}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 font-medium">{drug.dosageForm}</td>
                  <td className="p-4 font-bold text-slate-900">{drug.price} ج.م</td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 font-bold">
                      {isLowStock ? (
                        <span className="flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100 text-xs">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {drug.stockQuantity} (منخفض)
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 text-xs">
                          <PackageCheck className="w-3.5 h-3.5" />
                          {drug.stockQuantity}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onEdit(drug)}
                        className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                        title="تعديل"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          setDeleteModal({
                            isOpen: true,
                            drugId: drug._id,
                            drugName: drug.tradeName,
                          })
                        }
                        className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Delete Drug Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="حذف دواء من المخزن"
        message={`هل أنت متأكد من حذف الدواء (${deleteModal.drugName}) نهائياً من قاعدة بيانات المخزن؟`}
        confirmText="حذف الدواء"
        cancelText="إلغاء"
        type="danger"
        onConfirm={() => {
          onDelete(deleteModal.drugId);
          setDeleteModal({ isOpen: false, drugId: '', drugName: '' });
        }}
        onCancel={() => setDeleteModal({ isOpen: false, drugId: '', drugName: '' })}
      />
    </div>
  );
};
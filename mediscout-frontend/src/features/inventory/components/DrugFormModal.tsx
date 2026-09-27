import React, { useState, useEffect } from 'react';
import { type Drug } from '../../../types';
import { useCreateDrug, useUpdateDrug } from '../hooks/useInventory';
import { X, Loader2 } from 'lucide-react';

interface DrugFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Drug | null;
}

export const DrugFormModal: React.FC<DrugFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const [tradeName, setTradeName] = useState('');
  const [activeIngredientText, setActiveIngredientText] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [stockQuantity, setStockQuantity] = useState<number | ''>('');
  const [dosageForm, setDosageForm] = useState('Tablets');

  const createDrugMutation = useCreateDrug();
  const updateDrugMutation = useUpdateDrug();

  const isLoading = createDrugMutation.isPending || updateDrugMutation.isPending;

  useEffect(() => {
    if (initialData) {
      setTradeName(initialData.tradeName);
      setActiveIngredientText(initialData.activeIngredient.join(', '));
      setCategory(initialData.category);
      setPrice(initialData.price);
      setStockQuantity(initialData.stockQuantity);
      setDosageForm(initialData.dosageForm);
    } else {
      setTradeName('');
      setActiveIngredientText('');
      setCategory('');
      setPrice('');
      setStockQuantity('');
      setDosageForm('Tablets');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const activeIngredientArray = activeIngredientText
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    const drugPayload = {
      tradeName,
      activeIngredient: activeIngredientArray,
      category,
      price: Number(price),
      stockQuantity: Number(stockQuantity),
      dosageForm,
    };

    if (initialData) {
      updateDrugMutation.mutate(
        { id: initialData._id, drugData: drugPayload },
        { onSuccess: onClose }
      );
    } else {
      createDrugMutation.mutate(drugPayload, { onSuccess: onClose });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 dir-rtl">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900">
            {initialData ? 'تعديل بيانات علاج' : 'إضافة علاج جديد للمخزن'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">الاسم التجاري (Trade Name)</label>
            <input
              type="text"
              required
              value={tradeName}
              onChange={(e) => setTradeName(e.target.value)}
              placeholder="مثال: Augmentin 1g"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">المواد الفعالة (افصل بينها بفاصلة ,)</label>
            <input
              type="text"
              required
              value={activeIngredientText}
              onChange={(e) => setActiveIngredientText(e.target.value)}
              placeholder="مثال: amoxicillin, clavulanic acid"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">التصنيف (Category)</label>
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="مثال: Antibiotic"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">الشكل الدوائي (Dosage Form)</label>
              <select
                value={dosageForm}
                onChange={(e) => setDosageForm(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
              >
                <option value="Tablets">Tablets (أقراص)</option>
                <option value="Capsules">Capsules (كبسولات)</option>
                <option value="Syrup">Syrup (شراب)</option>
                <option value="Injection">Injection (حقن)</option>
                <option value="Cream">Cream / Ointment (مرهم/كريم)</option>
                <option value="Drops">Drops (قطرة)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">السعر (ج.م)</label>
              <input
                type="number"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
                placeholder="85"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">الكمية المتاحة (Stock)</label>
              <input
                type="number"
                min="0"
                required
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value ? Number(e.target.value) : '')}
                placeholder="38"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{initialData ? 'تحديث البيانات' : 'حفظ العلاج'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
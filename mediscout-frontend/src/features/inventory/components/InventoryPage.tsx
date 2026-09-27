import React, { useState } from 'react';
import { useGetDrugs, useDeleteDrug } from '../hooks/useInventory';
import { DrugTable } from './DrugTable';
import { DrugFormModal } from './DrugFormModal';
import { type Drug } from '../../../types';
import {
  Package,
  Plus,
  Search,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [activeIngredient, setActiveIngredient] = useState('');
  const [page, setPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);

  const { data, isLoading } = useGetDrugs({
    search,
    category,
    activeIngredient,
    page,
    limit: 10,
  });

  const deleteDrugMutation = useDeleteDrug();

  const handleOpenAddModal = () => {
    setSelectedDrug(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (drug: Drug) => {
    setSelectedDrug(drug);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteDrugMutation.mutate(id);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 dir-rtl min-h-screen bg-slate-50">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">إدارة أدوية المخزن</h1>
            <p className="text-xs text-slate-500">
              إجمالي الأدوية المسجلة: {data?.totalDrugs || 0} علاج
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="py-3 px-5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition flex items-center gap-2 cursor-pointer shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>إضافة علاج جديد</span>
        </button>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute right-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="البحث بالاسم التجاري..."
            className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
          />
        </div>

        <div>
          <input
            type="text"
            value={activeIngredient}
            onChange={(e) => {
              setActiveIngredient(e.target.value);
              setPage(1);
            }}
            placeholder="فلترة بالمادة الفعالة..."
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
          />
        </div>

        <div>
          <input
            type="text"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            placeholder="فلترة بالتصنيف (Antibiotic, Painkiller...)"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
          />
        </div>
      </div>

      {/* Drugs Table */}
      <DrugTable
        drugs={data?.drugs || []}
        onEdit={handleOpenEditModal}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      {/* Pagination Controls */}
      {data && data.pages > 1 && (
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500">
            الصفحة {data.page} من {data.pages}
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              className="p-2 border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50 transition"
            >
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>

            <button
              disabled={page === data.pages}
              onClick={() => setPage((prev) => Math.min(prev + 1, data.pages))}
              className="p-2 border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50 transition"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <DrugFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={selectedDrug}
      />
    </div>
  );
};
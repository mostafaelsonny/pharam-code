import React from "react";
import { Clock, CheckCircle2, PackageCheck } from "lucide-react";

interface PharmacistStatsProps {
  pendingCount: number;
}

export const PharmacistStats: React.FC<PharmacistStatsProps> = ({ pendingCount }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">الروشتات المعلقة</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{pendingCount}</h3>
        </div>
        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
          <Clock className="w-6 h-6" />
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">حالة الربط الفوري</p>
          <h3 className="text-lg font-bold text-emerald-600 mt-1">متصل وجاهز</h3>
        </div>
        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6" />
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">النظام الذكي AI</p>
          <h3 className="text-lg font-bold text-teal-600 mt-1">تفريغ تلقائي</h3>
        </div>
        <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
          <PackageCheck className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
import React from 'react';
import { Edit2, ShieldAlert, ShieldCheck, Trash2, UserCheck, Shield } from 'lucide-react';
import { type User } from '../../../types';

interface UserTableProps {
  users: User[];
  isLoading: boolean;
  onEdit: (user: User) => void;
  onToggleBlock: (user: User) => void;
  onDelete: (user: User) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  isLoading,
  onEdit,
  onToggleBlock,
  onDelete,
}) => {
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Shield className="w-3 h-3" />
            <span>أدمن</span>
          </span>
        );
      case 'pharmacist':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <UserCheck className="w-3 h-3" />
            <span>صيدلي</span>
          </span>
        );
      case 'delivery':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-red-50 text-blacl-700 border border-red-50">
            <UserCheck className="w-3 h-3" />
            <span>مندوب توصيل</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <span>مريض</span>
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs font-bold text-slate-400">
        جاري تحميل قائمة المستخدمين...
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs font-bold text-slate-500">
        لا يوجد مستخدمون يطابقون خيارات البحث الحالية.
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm dir-rtl">
      <div className="overflow-x-auto">
        <table className="w-full text-right text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
            <tr>
              <th className="px-5 py-3.5">المستخدم</th>
              <th className="px-5 py-3.5">الصلاحية (Role)</th>
              <th className="px-5 py-3.5">حالة الحساب</th>
              <th className="px-5 py-3.5">تاريخ انضمامه</th>
              <th className="px-5 py-3.5 text-left">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {users.map((u) => (
              <tr key={u._id} className="hover:bg-slate-50/80 transition">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 uppercase">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{u.name}</p>
                      <p className="text-[11px] text-slate-500">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">{getRoleBadge(u.role)}</td>
                <td className="px-5 py-3.5">
                  {u.isBlocked ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                      محظور
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                      نشط
                    </span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-slate-500">
                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString('ar-EG') : '—'}
                </td>
                <td className="px-5 py-3.5 text-left">
                  <div className="flex items-center justify-end gap-1.5">
                    {/* Edit */}
                    <button
                      onClick={() => onEdit(u)}
                      className="p-2 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition"
                      title="تعديل"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Toggle Block */}
                    <button
                      onClick={() => onToggleBlock(u)}
                      className={`p-2 rounded-lg transition ${
                        u.isBlocked
                          ? 'text-emerald-600 hover:bg-emerald-50'
                          : 'text-amber-600 hover:bg-amber-50'
                      }`}
                      title={u.isBlocked ? 'فك الحظر' : 'حظر الحساب'}
                    >
                      {u.isBlocked ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => onDelete(u)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
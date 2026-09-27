import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import {
  useGetUsers,
  useCreateUser,
  useUpdateUser,
  useToggleBlockUser,
  useDeleteUser,
} from '../hooks/useAdminUsers';
import { UserTable } from './UserTable';
import { UserFormModal } from './UserFormModal';
import { ConfirmModal } from '../../../components/common/ConfirmModal';
import { type User, type CreateUserData, type UpdateUserData } from '../../../types';

export const UsersManagementPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // TanStack Query Hooks
  const { data, isLoading } = useGetUsers({ search, role: roleFilter, page, limit: 8 });
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const toggleBlockMutation = useToggleBlockUser();
  const deleteUserMutation = useDeleteUser();

  const handleOpenAddModal = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    console.log(user)
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleModalSubmit = (formData: CreateUserData | UpdateUserData) => {
    if (selectedUser) {
      updateUserMutation.mutate(
        { id: selectedUser._id, userData: formData },
        { onSuccess: () => setIsModalOpen(false) }
      );
    } else {
      createUserMutation.mutate(formData as CreateUserData, {
        onSuccess: () => setIsModalOpen(false),
      });
    }
  };

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'danger' | 'warning' | 'info';
    action: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    action: () => {},
  });

  const handleToggleBlock = (user: User) => {
    const isUnblocking = user.isBlocked;
    setConfirmModal({
      isOpen: true,
      title: isUnblocking ? 'فك حظر المستخدم' : 'حظر المستخدم',
      message: isUnblocking
        ? `هل أنت متأكد من فك حظر حساب (${user.name})؟ سيتمكن من تسجيل الدخول واستخدام النظام مجدداً.`
        : `هل أنت متأكد من حظر حساب (${user.name})؟ لن يتمكن من تسجيل الدخول للمنصة حتى رفع الحظر.`,
      type: isUnblocking ? 'info' : 'warning',
      action: () => toggleBlockMutation.mutate(user._id),
    });
  };

  const handleDelete = (user: User) => {
    setConfirmModal({
      isOpen: true,
      title: 'حذف حساب المستخدم',
      message: `هل أنت متأكد تماماً من حذف حساب (${user.name}) نهائياً؟ هذا الإجراء لا يمكن التراجع عنه.`,
      type: 'danger',
      action: () => deleteUserMutation.mutate(user._id),
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 dir-rtl">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            <span>إدارة المستخدمين والصلاحيات</span>
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            التحكم بالحسابات، تغيير الصلاحيات، وإدارة الوصول لمنصة MediScout.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>إضافة مستخدم جديد</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="البحث بالاسم أو البريد..."
            className="w-full pr-10 pl-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600 transition"
          />
        </div>

        {/* Role Select Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-48 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600 font-semibold text-slate-700 cursor-pointer"
          >
            <option value="">جميع الصلاحيات</option>
            <option value="user">المرضى (Users)</option>
            <option value="pharmacist">الصيادلة (Pharmacists)</option>
            <option value="admin">مسؤولو النظام (Admins)</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <UserTable
        users={data?.users || []}
        isLoading={isLoading}
        onEdit={handleOpenEditModal}
        onToggleBlock={handleToggleBlock}
        onDelete={handleDelete}
      />

      {/* Pagination Controls */}
      {data && data.pages > 1 && (
        <div className="flex items-center justify-between bg-white px-5 py-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600">
          <span>
            صفحة {data.page} من {data.pages} (إجمالي {data.totalUsers} مستخدم)
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              disabled={page === data.pages}
              onClick={() => setPage((p) => p + 1)}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={selectedUser}
        isLoading={createUserMutation.isPending || updateUserMutation.isPending}
      />

      {/* Action Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText="تأكيد"
        cancelText="إلغاء"
        isLoading={toggleBlockMutation.isPending || deleteUserMutation.isPending}
        onConfirm={() => {
          confirmModal.action();
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
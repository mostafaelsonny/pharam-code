import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { type AppDispatch, type RootState } from '../../../store';
import { updateProfileThunk } from '../../../store/authSlice';
import {
  User as UserIcon,
  Mail,
  Lock,
  FileText,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Key,
} from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل'),
  email: z.string().email('يرجى إدخال بريد إلكتروني صحيح'),
  password: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 6, {
      message: 'كلمة السر الجديدة يجب أن تكون 6 أحرف على الأقل',
    }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export const UserProfilePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoading, error } = useSelector((state: RootState) => state.auth);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      password: '',
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    setSuccessMsg(null);
    const payload: { name?: string; email?: string; password?: string } = {
      name: data.name,
      email: data.email,
    };
    if (data.password && data.password.trim() !== '') {
      payload.password = data.password;
    }

    const res = await dispatch(updateProfileThunk(payload));
    if (updateProfileThunk.fulfilled.match(res)) {
      setSuccessMsg('تم تحديث بيانات الحساب بنجاح!');
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'pharmacist':
        return <span className="px-3 py-1 bg-teal-100 text-teal-800 font-bold rounded-full text-xs">صيدلي معتمد</span>;
      case 'admin':
        return <span className="px-3 py-1 bg-purple-100 text-purple-800 font-bold rounded-full text-xs">مسؤول نظام</span>;
      default:
        return <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full text-xs">مريض (مستخدم)</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 dir-rtl pb-12">
      {/* Header Profile Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-emerald-600 text-white font-black text-3xl flex items-center justify-center shadow-md">
            {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-10 h-10" />}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">{user?.name}</h1>
              {getRoleBadge(user?.role)}
            </div>
            <p className="text-xs font-semibold text-slate-500">{user?.email}</p>
            <span className="text-[11px] text-slate-400 block mt-1">معرّف الحساب: #{user?._id}</span>
          </div>
        </div>

        {/* Prescription History Quick Link Button for Patients */}
        {user?.role === 'user' && (
          <Link
            to="/prescriptions/history"
            className="w-full sm:w-auto px-5 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm shrink-0"
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>سجل الروشتات والطلبات</span>
          </Link>
        )}
      </div>

      {/* Profile Form Edit Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <h2 className="font-bold text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
          <UserIcon className="w-5 h-5 text-emerald-600" />
          تعديل البيانات الشخصية
        </h2>

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-xl">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">الاسم بالكامل *</label>
            <div className="relative flex items-center">
              <UserIcon className="absolute right-3.5 text-slate-400 w-4 h-4" />
              <input
                {...register('name')}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 pr-10 pl-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
            {errors.name && (
              <span className="text-xs text-rose-500 font-bold mt-1 block">
                {errors.name.message}
              </span>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">البريد الإلكتروني *</label>
            <div className="relative flex items-center">
              <Mail className="absolute right-3.5 text-slate-400 w-4 h-4" />
              <input
                {...register('email')}
                dir="ltr"
                className="w-full text-right bg-slate-50 border border-slate-200 text-slate-900 pr-10 pl-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
            {errors.email && (
              <span className="text-xs text-rose-500 font-bold mt-1 block">
                {errors.email.message}
              </span>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-slate-400" />
              تغيير كلمة السر (اخياري)
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute right-3.5 text-slate-400 w-4 h-4" />
              <input
                type="password"
                {...register('password')}
                placeholder="اتركه فارغاً إذا لا تريد التغيير"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 pr-10 pl-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
            {errors.password && (
              <span className="text-xs text-rose-500 font-bold mt-1 block">
                {errors.password.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="py-3 px-6 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl transition flex items-center gap-2 shadow-sm cursor-pointer"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isLoading ? 'جاري الحفظ...' : 'حفظ التعديلات'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
export default UserProfilePage;

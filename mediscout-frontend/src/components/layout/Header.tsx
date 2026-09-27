import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { type RootState, type AppDispatch } from '../../store';
import { logout } from '../../store/authSlice';
import {
  LogIn,
  LogOut,
  User as UserIcon,
  LayoutDashboard,
  Package,
  FileText,
} from 'lucide-react';

export  const Header: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const isPharmacist = user?.role === 'pharmacist';
  const isAdmin = user?.role === 'admin';
  const isUser = user?.role === 'user';
  const isDelivery = user?.role === 'delivery';

  return (
    <header className=" bg-white border-b border-slate-200 sticky top-0 z-40 dir-rtl  mb-7">
      <div className=" max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-black text-xl shadow-sm">
            ف
          </div>
          <div>
            <span className="text-lg font-bold text-slate-900 block leading-none">فارماكود</span>
            <span className="text-[10px] text-slate-500 font-medium">المنصة الطبية الذكية</span>
          </div>
        </div>

        {/* Dynamic User Quick Navigation (For Patients ONLY) */}
        {isAuthenticated && isUser && (
          <nav className="hidden md:flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/80">
            <Link
              to="/"
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-emerald-700 hover:bg-white transition flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>رفع روشتة</span>
            </Link>

            <Link
              to="/prescriptions/history"
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-emerald-700 hover:bg-white transition flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span>سجل الروشتات</span>
            </Link>
          </nav>
        )}

        {/* Dynamic Delivery Representative Quick Navigation */}
        {isAuthenticated && isDelivery && (
          <nav className="hidden md:flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/80">
            <Link
              to="/delivery/dashboard"
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-sky-700 hover:bg-white transition flex items-center gap-1.5"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>لوحة المندوب</span>
            </Link>
          </nav>
        )}

        {/* Dynamic Pharmacist Quick Navigation */}
        {isAuthenticated && isPharmacist && (
          <nav className="hidden md:flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/80">
            <Link
              to="/pharmacist/dashboard"
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-emerald-700 hover:bg-white transition flex items-center gap-1.5"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>لوحة الصيدلي</span>
            </Link>

            <Link
              to="/inventory"
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-emerald-700 hover:bg-white transition flex items-center gap-1.5"
            >
              <Package className="w-3.5 h-3.5" />
              <span>إدارة المخزن</span>
            </Link>
          </nav>
        )}

        {/* Dynamic Admin Quick Navigation */}
        {isAuthenticated && isAdmin && (
          <nav className="hidden md:flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/80">
            <Link
              to="/admin/users"
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-emerald-700 hover:bg-white transition flex items-center gap-1.5"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>لوحة الادمن</span>
            </Link>

            <Link
              to="/inventory"
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-emerald-700 hover:bg-white transition flex items-center gap-1.5"
            >
              <Package className="w-3.5 h-3.5" />
              <span>إدارة المخزن</span>
            </Link>
          </nav>
        )}

        {/* Auth Section */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              {/* User Badge Info -> Links to Profile */}
              <Link
                to="/profile"
                className="flex items-center gap-2.5 bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 px-3 py-1.5 rounded-xl transition cursor-pointer"
                title="عرض وتعديل الملف الشخصي"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                  {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-900 leading-tight">{user.name}</p>
                  <span className="text-[10px] font-semibold text-emerald-600 block capitalize">
                    {user.role === 'pharmacist'
                      ? 'صيدلي'
                      : user.role === 'delivery'
                      ? 'مندوب توصيل'
                      : user.role === 'admin'
                      ? 'مسؤول نظام'
                      : 'مريض'}
                  </span>
                </div>
              </Link>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-2.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition border border-transparent hover:border-rose-100 cursor-pointer"
                title="تسجيل الخروج"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            /* Guest Login Button */
            <Link
              to="/login"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-sm"
            >
              <LogIn className="w-4 h-4" />
              <span>تسجيل الدخول</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
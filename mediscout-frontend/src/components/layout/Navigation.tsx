import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { type RootState } from '../../store';
import { FileText, LayoutDashboard, Package, User as UserIcon, Upload } from 'lucide-react';

export const Navigation: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const isPharmacist = user?.role === 'pharmacist';
  const isAdmin = user?.role === 'admin';
  const isUser = user?.role === 'user';
  const isDelivery = user?.role === 'delivery';

  if (!isAuthenticated) return null;

  return (
    <nav className="md:hidden bg-white border-t border-slate-200 fixed bottom-0 left-0 right-0 z-40 dir-rtl p-2 flex justify-around items-center">
      {isUser && (
        <>
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 p-2 text-xs font-bold rounded-xl transition ${
                isActive ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500'
              }`
            }
          >
            <Upload className="w-5 h-5" />
            <span>رفع روشتة</span>
          </NavLink>

          <NavLink
            to="/prescriptions/history"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 p-2 text-xs font-bold rounded-xl transition ${
                isActive ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500'
              }`
            }
          >
            <FileText className="w-5 h-5" />
            <span>سجل الروشتات</span>
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 p-2 text-xs font-bold rounded-xl transition ${
                isActive ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500'
              }`
            }
          >
            <UserIcon className="w-5 h-5" />
            <span>حسابي</span>
          </NavLink>
        </>
      )}

      {isDelivery && (
        <>
          <NavLink
            to="/delivery/dashboard"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 p-2 text-xs font-bold rounded-xl transition ${
                isActive ? 'text-sky-600 bg-sky-50' : 'text-slate-500'
              }`
            }
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>لوحة المندوب</span>
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 p-2 text-xs font-bold rounded-xl transition ${
                isActive ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500'
              }`
            }
          >
            <UserIcon className="w-5 h-5" />
            <span>حسابي</span>
          </NavLink>
        </>
      )}

      {isPharmacist && (
        <>
          <NavLink
            to="/pharmacist/dashboard"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 p-2 text-xs font-bold rounded-xl transition ${
                isActive ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500'
              }`
            }
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>الداشبورد</span>
          </NavLink>

          <NavLink
            to="/inventory"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 p-2 text-xs font-bold rounded-xl transition ${
                isActive ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500'
              }`
            }
          >
            <Package className="w-5 h-5" />
            <span>المخزن</span>
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 p-2 text-xs font-bold rounded-xl transition ${
                isActive ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500'
              }`
            }
          >
            <UserIcon className="w-5 h-5" />
            <span>حسابي</span>
          </NavLink>
        </>
      )}

      {isAdmin && (
        <>
          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 p-2 text-xs font-bold rounded-xl transition ${
                isActive ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500'
              }`
            }
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>الداشبورد</span>
          </NavLink>

          <NavLink
            to="/inventory"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 p-2 text-xs font-bold rounded-xl transition ${
                isActive ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500'
              }`
            }
          >
            <Package className="w-5 h-5" />
            <span>المخزن</span>
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 p-2 text-xs font-bold rounded-xl transition ${
                isActive ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500'
              }`
            }
          >
            <UserIcon className="w-5 h-5" />
            <span>حسابي</span>
          </NavLink>
        </>
      )}
    </nav>
  );
};
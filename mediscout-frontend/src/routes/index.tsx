import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import { Loader2 } from 'lucide-react';

// ============================================================
// Lazy Loading للصفحات — كل صفحة تُحمَّل فقط عند الحاجة إليها
// هذا يقلل حجم الـ Bundle الأولي ويسرّع وقت التحميل
// ============================================================

// صفحات المصادقة
const LoginPage = lazy(() =>
  import('../features/auth/components/LoginPage').then((m) => ({
    default: m.LoginPage,
  }))
);
const RegisterPage = lazy(() =>
  import('../features/auth/components/RegisterPage').then((m) => ({
    default: m.RegisterPage,
  }))
);

// الصفحة الرئيسية (مساحة الروشتة)
const PrescriptionWorkspace = lazy(
  () => import('../features/prescriptions/components/PrescriptionWorkspace')
);

// صفحات خاصة بالمريض (user)
const CheckoutPage = lazy(
  () => import('../features/prescriptions/components/CheckoutPage')
);
const CheckoutSuccessPage = lazy(
  () => import('../features/prescriptions/components/CheckoutSuccessPage')
);
const PrescriptionHistoryPage = lazy(
  () => import('../features/prescriptions/components/PrescriptionHistoryPage')
);

// صفحة الملف الشخصي (مشتركة بين جميع الأدوار)
const UserProfilePage = lazy(() =>
  import('../features/auth/components/UserProfilePage').then((m) => ({
    default: m.UserProfilePage,
  }))
);

// صفحات مندوب التوصيل
const DeliveryDashboard = lazy(
  () => import('../features/delivery/components/DeliveryDashboard')
);

// صفحات الصيدلي والأدمن
const InventoryPage = lazy(() =>
  import('../features/inventory/components/InventoryPage').then((m) => ({
    default: m.InventoryPage,
  }))
);
const PharmacistDashboard = lazy(() =>
  import('../features/pharmacist/components/PharmacistDashboard').then((m) => ({
    default: m.PharmacistDashboard,
  }))
);

// صفحات الأدمن فقط
const UsersManagementPage = lazy(() =>
  import('../features/admin/components/UserManagementPage').then((m) => ({
    default: m.UsersManagementPage,
  }))
);

// ============================================================
// مكوّن الـ Loading — يظهر أثناء تحميل أي صفحة Lazy
// ============================================================
const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
  </div>
);

// ============================================================
// AppRoutes — يحتوي على هيكل التوجيه الكامل للتطبيق
// مقسّم إلى مجموعات حسب الصلاحيات والتخطيط
// ============================================================
export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ─────────────────────────────────────────────────────
            مجموعة 1: صفحات المصادقة (بدون AppLayout)
            تظهر بتصميم مستقل بدون Header أو Navigation
        ───────────────────────────────────────────────────── */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ─────────────────────────────────────────────────────
            مجموعة 2: صفحات التطبيق الرئيسية (داخل AppLayout)
            كل الصفحات هنا تشترك في Header و Navigation و StatusBar
        ───────────────────────────────────────────────────── */}
        <Route element={<AppLayout />}>

          {/* الصفحة الرئيسية — متاحة للجميع */}
          <Route path="/" element={<PrescriptionWorkspace />} />
          <Route path="/prescription/:id" element={<PrescriptionWorkspace />} />

          {/* ─────────────────────────────────────────────────
              مجموعة 2أ: صفحات المريض فقط (role: user)
          ───────────────────────────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={['user']} />}>
            <Route path="/checkout/:id" element={<CheckoutPage />} />
            <Route path="/checkout/success/:id" element={<CheckoutSuccessPage />} />
            <Route path="/prescriptions/history" element={<PrescriptionHistoryPage />} />
          </Route>

          {/* ─────────────────────────────────────────────────
              مجموعة 2ب: الملف الشخصي — لجميع الأدوار
          ───────────────────────────────────────────────── */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['user', 'pharmacist', 'admin', 'delivery']} />
            }
          >
            <Route path="/profile" element={<UserProfilePage />} />
          </Route>

          {/* ─────────────────────────────────────────────────
              مجموعة 2ج: صفحات مندوب التوصيل (role: delivery)
          ───────────────────────────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={['delivery']} />}>
            <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />
          </Route>

          {/* ─────────────────────────────────────────────────
              مجموعة 2د: صفحات الصيدلي والأدمن
          ───────────────────────────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={['pharmacist', 'admin']} />}>
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/pharmacist/dashboard" element={<PharmacistDashboard />} />
          </Route>

          {/* ─────────────────────────────────────────────────
              مجموعة 2هـ: صفحات الأدمن فقط (role: admin)
          ───────────────────────────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin/users" element={<UsersManagementPage />} />
          </Route>

        </Route>

        {/* ─────────────────────────────────────────────────────
            Fallback — أي مسار غير معروف يُعاد توجيهه للرئيسية
        ───────────────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;

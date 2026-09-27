import React from "react";

// 1. تعريف الـ Types الخاصة بخصائص المكون (Props)
interface BadgeProps {
  children: React.ReactNode; // النص أو المكون الموجود داخل الـ Badge
  variant?: "success" | "warning" | "danger" | "info"; // خيارات اللون المتاحة
}

// 2. المكون الأساسي
export const Badge: React.FC<BadgeProps> = ({ children, variant = "info" }) => {
  // كائن لتعيين كلاسات Tailwind بناءً على نوع الـ variant
  const variantStyles = {
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    danger: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    info: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-md ${variantStyles[variant]}`}
    >
      {children}
    </span>
  );
};

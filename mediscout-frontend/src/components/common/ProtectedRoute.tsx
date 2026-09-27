import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { type RootState } from "../../store";
import { type UserRole } from "../../types";

import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
}) => {
  const { user, isAuthenticated, isInitialized } = useSelector(
    (state: RootState) => state.auth,
  );

  // لسه بنتحقق من الـ session
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  // خلصنا التحقق والمستخدم مش authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // المستخدم authenticated لكن مش مسموح له بالـ role
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

// لو عملية ال getProfile خدت وقت طويل علشان تبعت الطلب و تستلم الرد مثلا 3 ثواني
//  ف ال isInitialized & isAuthenticated هيفضلوا بقيتمهم البدائيه اللي هي flase
// عمنا ال protected route اول ما يفتح في اول ثانيه هيلاقي ان isAutheticated ب false
// ف هيفتكر ان المستخدم دا ملهوش حاجه عندنا ف هيعتبره guest و يرميه بره زي الكلب
// و هوا يا ولدي هيبقي ظلمه لان عملية ال verification هي اللي اخرت و لسه مخلصتش
// علشان كدا لجأنا لل isInitialized لانه بيعبر عن اتمام العمليه
// ف حطينا شرط انه طول ما العمليه مرجتش رد يعني قيمة ال isItialized ب false ...
// يعمل loading وبس , و لما ترجع نتيجة العمليه و يبقي ال isInialized ب true ...
// ساعتها يشوف شغله مع ال isAuthetication
// ههههححححححححححححح

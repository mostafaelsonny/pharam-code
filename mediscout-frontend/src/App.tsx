import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes';

// ============================================================
// App — نقطة الدخول الرئيسية للتطبيق
// مسؤوليته الوحيدة: تغليف التطبيق بالـ BrowserRouter
// وتفويض منطق التوجيه الكامل لملف routes/index.tsx
// ============================================================
export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;
import React from 'react';
import { Outlet } from 'react-router-dom';
import  {Header}  from './Header';
import  StatusBar  from '../common/StatusBar';
import { Navigation } from './Navigation';

export const AppLayout: React.FC = () => {
  return (
    <div
      className=" min-h-screen bg-slate-50 text-slate-800 antialiased selection:bg-emerald-500 selection:text-white pb-16 relative"
      dir="rtl"
    >
      {/* Decorative background */}
      <div className="  absolute inset-0 bg-[linear-gradient(to_right,#e2e8f015_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f015_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

      {/* شريط حالة النظام العلوي */}

      {/* الهيدر وشريط التنقل الرئيسي */}
      <Header />
      <StatusBar />


      {/* محتوى الصفحات الفرعية */}
      <main className="max-w-7xl mx-auto px-4 pt-6 relative z-10 space-y-6">
        <Outlet />
      </main>
      <Navigation/>
    </div>
  );
};

export default AppLayout;
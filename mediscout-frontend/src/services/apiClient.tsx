import axios from 'axios';

// قراءة رابط الـ API من متغيرات البيئة مع fallback للتطوير المحلي
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// إرفاق Token المستخدم تلقائياً مع كل طلب يتطلب مصادقة
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  }
);
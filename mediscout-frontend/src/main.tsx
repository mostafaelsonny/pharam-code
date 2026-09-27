import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from './store';
import App from './App';
import { AuthInitializer } from "./features/auth/components/AuthInitializer";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // الاحتفاظ بالبيانات لمدة 5 دقائق قبل إعادة الطلب
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthInitializer>

        <App />
        </AuthInitializer>
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>
);
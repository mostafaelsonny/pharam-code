import { configureStore } from '@reduxjs/toolkit';
import prescriptionReducer from './prescriptionSlice';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    prescription: prescriptionReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
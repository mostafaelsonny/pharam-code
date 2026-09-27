import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";

import {
  loginAPI,
  registerAPI,
  getProfileAPI,
  updateProfileAPI,
} from "../features/auth/services/authService";
import {
  type User,
  type AuthResponse,
  type LoginPayload,
  type RegisterPayload,
} from "../types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

const savedToken = localStorage.getItem("auth_token");
const savedUser = localStorage.getItem("auth_user");

const initialState: AuthState = {
  user: savedUser ? JSON.parse(savedUser) : null,
  token: savedToken || null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isInitialized: false,
};

// 1. تسجيل الدخول
export const loginThunk = createAsyncThunk<
  AuthResponse,
  LoginPayload,
  { rejectValue: string }
>("auth/login", async (payload, { rejectWithValue }) => {
  try {
    return await loginAPI(payload);
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "فشل تسجيل الدخول");
  }
});

// 2. إنشاء حساب جديد
export const registerThunk = createAsyncThunk<
  AuthResponse,
  RegisterPayload,
  { rejectValue: string }
>("auth/register", async (payload, { rejectWithValue }) => {
  try {
    return await registerAPI(payload);
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "فشل إنشاء الحساب");
  }
});

// التاكد من ان ال token صالح ولم ينتهي و ان المستخدم ليس blocked
export const getProfileThunk = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>("auth/getProfile", async (_, { rejectWithValue }) => {
  try {
    return await getProfileAPI();
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "فشل التحقق من بيانات المستخدم",
    );
  }
});

// 4. تحديث البيانات الشخصية
export const updateProfileThunk = createAsyncThunk<
  AuthResponse,
  { name?: string; email?: string; password?: string },
  { rejectValue: string }
>("auth/updateProfile", async (payload, { rejectWithValue }) => {
  try {
    return await updateProfileAPI(payload);
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "فشل تحديث البيانات الشخصية");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    logout: (state) => {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isInitialized = true;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    initializeAuth: (state) => {
      state.isInitialized = true;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        loginThunk.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.isLoading = false;
          state.isAuthenticated = true;
          state.token = action.payload.token;
          state.isInitialized = true;
          state.user = {
            _id: action.payload._id,
            name: action.payload.name,
            email: action.payload.email,
            role: action.payload.role,
          };
          localStorage.setItem("auth_token", action.payload.token);
          localStorage.setItem("auth_user", JSON.stringify(state.user));
        },
      )
      .addCase(loginThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Register
      .addCase(registerThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        registerThunk.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.isLoading = false;
          state.isAuthenticated = true;
          state.token = action.payload.token;
          state.isInitialized = true;
          state.user = {
            _id: action.payload._id,
            name: action.payload.name,
            email: action.payload.email,
            role: action.payload.role,
          };
          localStorage.setItem("auth_token", action.payload.token);
          localStorage.setItem("auth_user", JSON.stringify(state.user));
        },
      )
      .addCase(registerThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // get profile
      .addCase(getProfileThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProfileThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.isAuthenticated = true;
        state.user = action.payload;

        localStorage.setItem("auth_user", JSON.stringify(action.payload));
      })
      .addCase(getProfileThunk.rejected, (state) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;

        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
      })

      // update profile
      .addCase(updateProfileThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = {
          _id: action.payload._id,
          name: action.payload.name,
          email: action.payload.email,
          role: action.payload.role,
        };
        state.token = action.payload.token;
        localStorage.setItem("auth_token", action.payload.token);
        localStorage.setItem("auth_user", JSON.stringify(state.user));
      })
      .addCase(updateProfileThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearAuthError , initializeAuth } = authSlice.actions;
export default authSlice.reducer;

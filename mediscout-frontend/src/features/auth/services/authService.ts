import { apiClient } from '../../../services/apiClient';
import {
  type AuthResponse,
  type LoginPayload,
  type RegisterPayload,
  type User,
} from '../../../types';

export const loginAPI = async (payload: LoginPayload): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', payload);
  return response.data;
};

export const registerAPI = async (payload: RegisterPayload): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/register', payload);
  return response.data;
};

export const getProfileAPI = async (): Promise<User> => {
  const response = await apiClient.get<User>('/auth/profile');
  return response.data;
};

export const updateProfileAPI = async (payload: { name?: string; email?: string; password?: string }): Promise<AuthResponse> => {
  const response = await apiClient.put<AuthResponse>('/auth/profile', payload);
  return response.data;
};
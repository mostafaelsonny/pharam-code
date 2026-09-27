import { apiClient } from '../../../services/apiClient';
import {
  type UsersPaginatedResponse,
  type GetUsersQueryParams,
  type CreateUserData,
  type UpdateUserData,
  type User,
} from '../../../types';

export const getUsersAPI = async (
  params: GetUsersQueryParams
): Promise<UsersPaginatedResponse> => {
  const { data } = await apiClient.get<UsersPaginatedResponse>('/users', {
    params,
  });
  return data;
};

export const createUserAPI = async (userData: CreateUserData): Promise<User> => {
  const { data } = await apiClient.post<User>('/users', userData);
  return data;
};

export const updateUserAPI = async ({
  id,
  userData,
}: {
  id: string;
  userData: UpdateUserData;
}): Promise<User> => {
  const { data } = await apiClient.put<User>(`/users/${id}`, userData);
  return data;
};

export const toggleBlockUserAPI = async (
  id: string
): Promise<{ message: string; _id: string; isBlocked: boolean }> => {
  const { data } = await apiClient.patch<{
    message: string;
    _id: string;
    isBlocked: boolean;
  }>(`/users/${id}/block`);
  return data;
};

export const deleteUserAPI = async (
  id: string
): Promise<{ message: string }> => {
  const { data } = await apiClient.delete<{ message: string }>(`/users/${id}`);
  return data;
};
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getUsersAPI,
  createUserAPI,
  updateUserAPI,
  toggleBlockUserAPI,
  deleteUserAPI,
} from '../services/adminUserService';
import { type GetUsersQueryParams } from '../../../types';

export const ADMIN_USERS_QUERY_KEY = 'admin-users';

// جلب المستخدمين
export const useGetUsers = (params: GetUsersQueryParams) => {
  return useQuery({
    queryKey: [ADMIN_USERS_QUERY_KEY, params],
    queryFn: () => getUsersAPI(params),
    placeholderData: (previousData) => previousData,
  });
};

// إنشاء مستخدم جديد
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUserAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_USERS_QUERY_KEY] });
    },
  });
};

// تعديل بيانات مستخدم
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateUserAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_USERS_QUERY_KEY] });
    },
  });
};

// حظر أو فك حظر
export const useToggleBlockUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleBlockUserAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_USERS_QUERY_KEY] });
    },
  });
};

// حذف مستخدم
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUserAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_USERS_QUERY_KEY] });
    },
  });
};
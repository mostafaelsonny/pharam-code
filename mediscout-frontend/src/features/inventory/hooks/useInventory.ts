import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchDrugsAPI,
  createDrugAPI,
  updateDrugAPI,
  deleteDrugAPI,
} from '../services/inventoryService';
import { type DrugFilterParams, type Drug } from '../../../types';

// 1. Hook جلب الأدوية مع دعم التخزين المؤقت والفلترة
export const useGetDrugs = (params: DrugFilterParams) => {
  return useQuery({
    queryKey: ['drugs', params],
    queryFn: () => fetchDrugsAPI(params),
  });
};

// 2. Hook إضافة دواء جديد وإلغاء الـ Cache لإعادة الجلب فوراً
export const useCreateDrug = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newDrug: Omit<Drug, '_id'>) => createDrugAPI(newDrug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drugs'] });
    },
  });
};

// 3. Hook تعديل دواء
export const useUpdateDrug = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, drugData }: { id: string; drugData: Partial<Drug> }) =>
      updateDrugAPI({ id, drugData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drugs'] });
    },
  });
};

// 4. Hook حذف دواء
export const useDeleteDrug = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDrugAPI(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drugs'] });
    },
  });
};
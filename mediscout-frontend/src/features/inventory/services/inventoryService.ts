import { apiClient } from '../../../services/apiClient';
import {
  type Drug,
  type DrugFilterParams,
  type GetDrugsResponse,
} from '../../../types';

export const fetchDrugsAPI = async (
  params: DrugFilterParams
): Promise<GetDrugsResponse> => {
  const response = await apiClient.get<GetDrugsResponse>('/drugs', { params });
  return response.data;
};

export const createDrugAPI = async (
  drugData: Omit<Drug, '_id'>
): Promise<Drug> => {
  const response = await apiClient.post<Drug>('/drugs', drugData);
  return response.data;
};

export const updateDrugAPI = async ({
  id,
  drugData,
}: {
  id: string;
  drugData: Partial<Drug>;
}): Promise<Drug> => {
  const response = await apiClient.put<Drug>(`/drugs/${id}`, drugData);
  return response.data;
};

export const deleteDrugAPI = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(`/drugs/${id}`);
  return response.data;
};
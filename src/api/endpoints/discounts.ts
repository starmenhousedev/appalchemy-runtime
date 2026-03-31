import apiClient from '../client';
import type { ApiResponse, Discount } from '../../types';

export const discountsApi = {
  async list(status?: 'active' | 'inactive') {
    const { data } = await apiClient.get<ApiResponse<Discount[]>>(
      '/discounts',
      { params: status ? { status } : undefined },
    );
    return data.data;
  },

  async create(discount: Omit<Discount, 'id' | 'shop_id' | 'createdAt' | 'updatedAt'>) {
    const { data } = await apiClient.post<ApiResponse<Discount>>(
      '/discounts',
      discount,
    );
    return data.data;
  },

  async get(id: number) {
    const { data } = await apiClient.get<ApiResponse<Discount>>(
      `/discounts/${id}`,
    );
    return data.data;
  },

  async update(id: number, updates: Partial<Discount>) {
    const { data } = await apiClient.put<ApiResponse<Discount>>(
      `/discounts/${id}`,
      updates,
    );
    return data.data;
  },

  async delete(id: number) {
    const { data } = await apiClient.delete<ApiResponse<null>>(
      `/discounts/${id}`,
    );
    return data;
  },

  async clone(id: number) {
    const { data } = await apiClient.post<ApiResponse<Discount>>(
      `/discounts/${id}/clone`,
    );
    return data.data;
  },

  async toggle(id: number) {
    const { data } = await apiClient.put<ApiResponse<Discount>>(
      `/discounts/${id}/toggle`,
    );
    return data.data;
  },
};

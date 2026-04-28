import apiClient from '../client';
import type { ApiResponse, Discount } from '../../types';

export const discountsApi = {
  async list(status?: 'active' | 'inactive') {
    const { data } = await apiClient.get<ApiResponse<any>>(
      '/discounts',
      { params: status ? { status } : undefined },
    );
    const payload = data?.data;
    if (Array.isArray(payload)) return payload as Discount[];
    if (payload && Array.isArray(payload.discounts)) return payload.discounts as Discount[];
    return [] as Discount[];
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

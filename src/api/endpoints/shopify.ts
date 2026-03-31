import apiClient from '../client';
import type { ApiResponse } from '../../types';

export const shopifyApi = {
  async getCollections() {
    const { data } = await apiClient.get<ApiResponse<Record<string, unknown>[]>>(
      '/shopify/collections',
    );
    return data.data;
  },

  async getProducts(params?: { page?: number; limit?: number; query?: string }) {
    const { data } = await apiClient.get<ApiResponse<Record<string, unknown>[]>>(
      '/shopify/products',
      { params },
    );
    return data.data;
  },

  async getBlogs() {
    const { data } = await apiClient.get<ApiResponse<Record<string, unknown>[]>>(
      '/shopify/blogs',
    );
    return data.data;
  },

  async createOrder(orderData: Record<string, unknown>) {
    const { data } = await apiClient.post<ApiResponse<Record<string, unknown>>>(
      '/shopify/orders',
      orderData,
    );
    return data.data;
  },

  async listOrders(params?: { page?: number; limit?: number }) {
    const { data } = await apiClient.get<ApiResponse<Record<string, unknown>[]>>(
      '/shopify/orders',
      { params },
    );
    return data.data;
  },
};

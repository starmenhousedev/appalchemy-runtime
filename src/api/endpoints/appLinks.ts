import apiClient from '../client';
import type { ApiResponse, AppLink } from '../../types';

export const appLinksApi = {
  async createDeeplink(link: { title: string; target_url: string; config?: Record<string, unknown> }) {
    const { data } = await apiClient.post<ApiResponse<AppLink>>(
      '/app-links/deeplink',
      link,
    );
    return data.data;
  },

  async listDeeplinks() {
    const { data } = await apiClient.get<ApiResponse<AppLink[]>>(
      '/app-links/deeplinks',
    );
    return data.data;
  },

  async getDeeplink(id: number) {
    const { data } = await apiClient.get<ApiResponse<AppLink>>(
      `/app-links/deeplinks/${id}`,
    );
    return data.data;
  },

  async deleteDeeplink(id: number) {
    const { data } = await apiClient.delete<ApiResponse<null>>(
      `/app-links/deeplinks/${id}`,
    );
    return data;
  },

  async createOnelink(link: { title: string; target_url: string; config?: Record<string, unknown> }) {
    const { data } = await apiClient.post<ApiResponse<AppLink>>(
      '/app-links/onelink',
      link,
    );
    return data.data;
  },

  async listOnelinks() {
    const { data } = await apiClient.get<ApiResponse<AppLink[]>>(
      '/app-links/onelinks',
    );
    return data.data;
  },
};

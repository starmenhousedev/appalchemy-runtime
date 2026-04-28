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
    const { data } = await apiClient.get<ApiResponse<any>>('/app-links/deeplinks');
    const payload = data?.data;
    if (Array.isArray(payload)) return payload as AppLink[];
    if (payload && Array.isArray(payload.deeplinks)) return payload.deeplinks as AppLink[];
    return [] as AppLink[];
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
    const { data } = await apiClient.get<ApiResponse<any>>('/app-links/onelinks');
    const payload = data?.data;
    if (Array.isArray(payload)) return payload as AppLink[];
    if (payload && Array.isArray(payload.onelinks)) return payload.onelinks as AppLink[];
    return [] as AppLink[];
  },
};

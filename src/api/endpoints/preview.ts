import apiClient from '../client';
import type { ApiResponse, PreviewDevice } from '../../types';

export const previewApi = {
  async getDevices() {
    const { data } = await apiClient.get<ApiResponse<PreviewDevice[]>>(
      '/preview/devices',
    );
    return data.data;
  },

  async getThemePreview(themeId: number) {
    const { data } = await apiClient.get<ApiResponse<Record<string, unknown>>>(
      `/preview/${themeId}`,
    );
    return data.data;
  },

  async getPagePreview(themeId: number, pageId: number) {
    const { data } = await apiClient.get<ApiResponse<Record<string, unknown>>>(
      `/preview/${themeId}/page/${pageId}`,
    );
    return data.data;
  },
};

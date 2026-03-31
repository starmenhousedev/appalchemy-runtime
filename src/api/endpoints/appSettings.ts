import apiClient from '../client';
import type { ApiResponse, LaunchScreen, AppInfo } from '../../types';

export const appSettingsApi = {
  async getLaunchScreen() {
    const { data } = await apiClient.get<ApiResponse<LaunchScreen>>(
      '/app-settings/launch-screen',
    );
    return data.data;
  },

  async updateLaunchScreen(settings: Partial<LaunchScreen>) {
    const { data } = await apiClient.put<ApiResponse<LaunchScreen>>(
      '/app-settings/launch-screen',
      settings,
    );
    return data.data;
  },

  async uploadLaunchMedia(formData: FormData) {
    const { data } = await apiClient.post<ApiResponse<{ url: string }>>(
      '/app-settings/launch-screen/upload',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data.data;
  },

  async getAppInfo() {
    const { data } = await apiClient.get<ApiResponse<AppInfo>>(
      '/app-settings/app-info',
    );
    return data.data;
  },

  async updateAppInfo(info: Partial<AppInfo>) {
    const { data } = await apiClient.put<ApiResponse<AppInfo>>(
      '/app-settings/app-info',
      info,
    );
    return data.data;
  },
};

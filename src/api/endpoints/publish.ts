import apiClient from '../client';
import type { ApiResponse, Build, BuildPlatform, PublishStatus } from '../../types';

export const publishApi = {
  async build(params: {
    imported_theme_id: number;
    platform: BuildPlatform;
    version: string;
  }) {
    const { data } = await apiClient.post<ApiResponse<Build>>(
      '/publish/build',
      params,
    );
    return data.data;
  },

  async listBuilds() {
    const { data } = await apiClient.get<ApiResponse<Build[]>>(
      '/publish/builds',
    );
    return data.data;
  },

  async getBuildStatus(buildId: number) {
    const { data } = await apiClient.get<ApiResponse<Build>>(
      `/publish/build/${buildId}/status`,
    );
    return data.data;
  },

  async downloadBuild(buildId: number) {
    const { data } = await apiClient.get<ApiResponse<{ url: string }>>(
      `/publish/build/${buildId}/download`,
    );
    return data.data;
  },

  async submitPlayStore(buildId: number) {
    const { data } = await apiClient.post<ApiResponse<{ status: string }>>(
      '/publish/play-store',
      { build_id: buildId },
    );
    return data.data;
  },

  async submitAppStore(buildId: number) {
    const { data } = await apiClient.post<ApiResponse<{ status: string }>>(
      '/publish/app-store',
      { build_id: buildId },
    );
    return data.data;
  },

  async getPublishStatus() {
    const { data } = await apiClient.get<ApiResponse<PublishStatus>>(
      '/publish/status',
    );
    return data.data;
  },
};

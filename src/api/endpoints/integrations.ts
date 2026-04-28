import apiClient from '../client';
import type { ApiResponse, Integration, IntegrationProvider } from '../../types';

export const integrationsApi = {
  async list() {
    const { data } = await apiClient.get<ApiResponse<any>>('/integrations');
    const payload = data?.data;
    if (Array.isArray(payload)) return payload as Integration[];
    if (payload && Array.isArray(payload.integrations)) return payload.integrations as Integration[];
    return [] as Integration[];
  },

  async get(provider: IntegrationProvider) {
    const { data } = await apiClient.get<ApiResponse<Integration>>(
      `/integrations/${provider}`,
    );
    return data.data;
  },

  async connect(
    provider: IntegrationProvider,
    credentials: Record<string, unknown>,
  ) {
    const { data } = await apiClient.post<ApiResponse<Integration>>(
      `/integrations/${provider}/connect`,
      { credentials },
    );
    return data.data;
  },

  async update(
    provider: IntegrationProvider,
    settings: Record<string, unknown>,
  ) {
    const { data } = await apiClient.put<ApiResponse<Integration>>(
      `/integrations/${provider}`,
      { settings },
    );
    return data.data;
  },

  async disconnect(provider: IntegrationProvider) {
    const { data } = await apiClient.delete<ApiResponse<null>>(
      `/integrations/${provider}/disconnect`,
    );
    return data;
  },
};

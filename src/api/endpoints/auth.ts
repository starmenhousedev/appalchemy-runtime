import apiClient from '../client';
import { API_BASE_URL } from '../../utils/constants';
import type { ApiResponse, SessionData, TokenResponse } from '../../types';

export const authApi = {
  getInstallUrl(shop: string): string {
    return `${API_BASE_URL}/auth/install?shop=${encodeURIComponent(shop)}&source=mobile`;
  },

  async refreshToken() {
    const { data } = await apiClient.post<ApiResponse<TokenResponse>>(
      '/auth/token/refresh',
    );
    return data.data;
  },

  async getSession() {
    const { data } = await apiClient.get<ApiResponse<SessionData>>(
      '/auth/session',
    );
    return data.data;
  },
};

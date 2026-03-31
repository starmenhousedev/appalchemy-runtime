import apiClient from '../client';
import type { ApiResponse, PaginatedResponse, Media } from '../../types';

export const mediaApi = {
  async upload(formData: FormData) {
    const { data } = await apiClient.post<ApiResponse<Media>>(
      '/media/upload',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data.data;
  },

  async list(params?: { page?: number; limit?: number }) {
    const { data } = await apiClient.get<PaginatedResponse<Media>>('/media', {
      params,
    });
    return data;
  },

  async delete(id: number) {
    const { data } = await apiClient.delete<ApiResponse<null>>(`/media/${id}`);
    return data;
  },
};

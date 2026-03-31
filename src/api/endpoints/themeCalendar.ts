import apiClient from '../client';
import type { ApiResponse, ThemeCalendarEntry } from '../../types';

export const themeCalendarApi = {
  async list() {
    const { data } = await apiClient.get<ApiResponse<ThemeCalendarEntry[]>>(
      '/theme-calendar',
    );
    return data.data;
  },

  async create(entry: {
    imported_theme_id: number;
    title: string;
    activate_at: string;
    deactivate_at: string;
  }) {
    const { data } = await apiClient.post<ApiResponse<ThemeCalendarEntry>>(
      '/theme-calendar',
      entry,
    );
    return data.data;
  },

  async update(id: number, updates: Partial<ThemeCalendarEntry>) {
    const { data } = await apiClient.put<ApiResponse<ThemeCalendarEntry>>(
      `/theme-calendar/${id}`,
      updates,
    );
    return data.data;
  },

  async delete(id: number) {
    const { data } = await apiClient.delete<ApiResponse<null>>(
      `/theme-calendar/${id}`,
    );
    return data;
  },
};

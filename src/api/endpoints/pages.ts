import apiClient from '../client';
import type { ApiResponse, Page, PageType } from '../../types';

export const pagesApi = {
  async list(themeId: number) {
    const { data } = await apiClient.get<ApiResponse<Page[]>>(
      `/themes/imported/${themeId}/pages`,
    );
    return data.data;
  },

  async create(
    themeId: number,
    page: { title: string; type: PageType; settings?: Record<string, unknown> },
  ) {
    const { data } = await apiClient.post<ApiResponse<Page>>(
      `/themes/imported/${themeId}/pages`,
      page,
    );
    return data.data;
  },

  async get(themeId: number, pageId: number) {
    const { data } = await apiClient.get<ApiResponse<Page>>(
      `/themes/imported/${themeId}/pages/${pageId}`,
    );
    return data.data;
  },

  async update(themeId: number, pageId: number, updates: Partial<Page>) {
    const { data } = await apiClient.put<ApiResponse<Page>>(
      `/themes/imported/${themeId}/pages/${pageId}`,
      updates,
    );
    return data.data;
  },

  async delete(themeId: number, pageId: number) {
    const { data } = await apiClient.delete<ApiResponse<null>>(
      `/themes/imported/${themeId}/pages/${pageId}`,
    );
    return data;
  },

  async toggleVisibility(themeId: number, pageId: number) {
    const { data } = await apiClient.put<ApiResponse<Page>>(
      `/themes/imported/${themeId}/pages/${pageId}/visibility`,
    );
    return data.data;
  },

  async reorder(themeId: number, pageIds: number[]) {
    const { data } = await apiClient.put<ApiResponse<null>>(
      `/themes/imported/${themeId}/pages/reorder`,
      { pageIds },
    );
    return data;
  },

  async duplicate(themeId: number, pageId: number) {
    const { data } = await apiClient.post<ApiResponse<Page>>(
      `/themes/imported/${themeId}/pages/${pageId}/duplicate`,
    );
    return data.data;
  },
};

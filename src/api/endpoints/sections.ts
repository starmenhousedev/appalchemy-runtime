import apiClient from '../client';
import type { ApiResponse, Section, SectionType } from '../../types';

export const sectionsApi = {
  async list(pageId: number) {
    const { data } = await apiClient.get<ApiResponse<Section[]>>(
      `/pages/${pageId}/sections`,
    );
    return data.data;
  },

  async create(
    pageId: number,
    section: { type: SectionType; title: string; config?: Record<string, unknown> },
  ) {
    const { data } = await apiClient.post<ApiResponse<Section>>(
      `/pages/${pageId}/sections`,
      section,
    );
    return data.data;
  },

  async get(pageId: number, sectionId: number) {
    const { data } = await apiClient.get<ApiResponse<Section>>(
      `/pages/${pageId}/sections/${sectionId}`,
    );
    return data.data;
  },

  async update(pageId: number, sectionId: number, updates: Partial<Section>) {
    const { data } = await apiClient.put<ApiResponse<Section>>(
      `/pages/${pageId}/sections/${sectionId}`,
      updates,
    );
    return data.data;
  },

  async delete(pageId: number, sectionId: number) {
    const { data } = await apiClient.delete<ApiResponse<null>>(
      `/pages/${pageId}/sections/${sectionId}`,
    );
    return data;
  },

  async toggleVisibility(pageId: number, sectionId: number) {
    const { data } = await apiClient.put<ApiResponse<Section>>(
      `/pages/${pageId}/sections/${sectionId}/visibility`,
    );
    return data.data;
  },

  async reorder(pageId: number, sectionIds: number[]) {
    const { data } = await apiClient.put<ApiResponse<null>>(
      `/pages/${pageId}/sections/reorder`,
      { sectionIds },
    );
    return data;
  },
};

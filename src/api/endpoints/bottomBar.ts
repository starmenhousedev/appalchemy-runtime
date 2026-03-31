import apiClient from '../client';
import type { ApiResponse, BottomBarItem } from '../../types';

export const bottomBarApi = {
  async get(themeId: number) {
    const { data } = await apiClient.get<ApiResponse<BottomBarItem[]>>(
      `/themes/imported/${themeId}/bottom-bar`,
    );
    return data.data;
  },

  async update(themeId: number, items: Partial<BottomBarItem>[]) {
    const { data } = await apiClient.put<ApiResponse<BottomBarItem[]>>(
      `/themes/imported/${themeId}/bottom-bar`,
      { items },
    );
    return data.data;
  },

  async addItem(
    themeId: number,
    item: { page_id: number; label: string; icon: string },
  ) {
    const { data } = await apiClient.post<ApiResponse<BottomBarItem>>(
      `/themes/imported/${themeId}/bottom-bar/items`,
      item,
    );
    return data.data;
  },

  async updateItem(
    themeId: number,
    itemId: number,
    updates: Partial<BottomBarItem>,
  ) {
    const { data } = await apiClient.put<ApiResponse<BottomBarItem>>(
      `/themes/imported/${themeId}/bottom-bar/items/${itemId}`,
      updates,
    );
    return data.data;
  },

  async deleteItem(themeId: number, itemId: number) {
    const { data } = await apiClient.delete<ApiResponse<null>>(
      `/themes/imported/${themeId}/bottom-bar/items/${itemId}`,
    );
    return data;
  },

  async reorderItems(themeId: number, itemIds: number[]) {
    const { data } = await apiClient.put<ApiResponse<null>>(
      `/themes/imported/${themeId}/bottom-bar/items/reorder`,
      { itemIds },
    );
    return data;
  },
};

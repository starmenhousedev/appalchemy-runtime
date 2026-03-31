import apiClient from '../client';
import type {
  ApiResponse,
  Theme,
  ImportedTheme,
  ThemeSettings,
  CartGoal,
  ProductLabel,
  ProductSortingConfig,
} from '../../types';

export const themesApi = {
  // Starter themes
  async listThemes() {
    const { data } = await apiClient.get<ApiResponse<Theme[]>>('/themes');
    return data.data;
  },

  async getTheme(themeId: number) {
    const { data } = await apiClient.get<ApiResponse<Theme>>(
      `/themes/${themeId}`,
    );
    return data.data;
  },

  // Import
  async importTheme(themeId: number) {
    const { data } = await apiClient.post<ApiResponse<ImportedTheme>>(
      `/themes/${themeId}/import`,
    );
    return data.data;
  },

  // Imported themes
  async listImported() {
    const { data } = await apiClient.get<ApiResponse<ImportedTheme[]>>(
      '/themes/imported/list',
    );
    return data.data;
  },

  async renameImported(id: number, name: string) {
    const { data } = await apiClient.put<ApiResponse<ImportedTheme>>(
      `/themes/imported/${id}/rename`,
      { name },
    );
    return data.data;
  },

  async deleteImported(id: number) {
    const { data } = await apiClient.delete<ApiResponse<null>>(
      `/themes/imported/${id}`,
    );
    return data;
  },

  async duplicateImported(id: number) {
    const { data } = await apiClient.post<ApiResponse<ImportedTheme>>(
      `/themes/imported/${id}/duplicate`,
    );
    return data.data;
  },

  async enableImported(id: number) {
    const { data } = await apiClient.put<ApiResponse<ImportedTheme>>(
      `/themes/imported/${id}/enable`,
    );
    return data.data;
  },

  async disableImported(id: number) {
    const { data } = await apiClient.put<ApiResponse<ImportedTheme>>(
      `/themes/imported/${id}/disable`,
    );
    return data.data;
  },

  async pinImported(id: number) {
    const { data } = await apiClient.put<ApiResponse<ImportedTheme>>(
      `/themes/imported/${id}/pin`,
    );
    return data.data;
  },

  async scheduleImported(id: number, scheduled_at: string) {
    const { data } = await apiClient.post<ApiResponse<ImportedTheme>>(
      `/themes/imported/${id}/schedule`,
      { scheduled_at },
    );
    return data.data;
  },

  // Theme code
  async getCode(id: number) {
    const { data } = await apiClient.get<ApiResponse<{ code: string }>>(
      `/themes/imported/${id}/code`,
    );
    return data.data;
  },

  async updateCode(id: number, code: string) {
    const { data } = await apiClient.put<ApiResponse<ImportedTheme>>(
      `/themes/imported/${id}/code`,
      { code },
    );
    return data.data;
  },

  // Theme settings
  async getSettings(id: number) {
    const { data } = await apiClient.get<ApiResponse<ThemeSettings>>(
      `/themes/imported/${id}/settings`,
    );
    return data.data;
  },

  async updateSettings(id: number, settings: Partial<ThemeSettings>) {
    const { data } = await apiClient.put<ApiResponse<ThemeSettings>>(
      `/themes/imported/${id}/settings`,
      settings,
    );
    return data.data;
  },

  async getProductLabels(id: number) {
    const { data } = await apiClient.get<ApiResponse<ProductLabel[]>>(
      `/themes/imported/${id}/settings/product-labels`,
    );
    return data.data;
  },

  async updateProductLabels(id: number, labels: ProductLabel[]) {
    const { data } = await apiClient.put<ApiResponse<ProductLabel[]>>(
      `/themes/imported/${id}/settings/product-labels`,
      { labels },
    );
    return data.data;
  },

  async getProductSorting(id: number) {
    const { data } = await apiClient.get<ApiResponse<ProductSortingConfig>>(
      `/themes/imported/${id}/settings/product-sorting`,
    );
    return data.data;
  },

  async updateProductSorting(id: number, sorting: ProductSortingConfig) {
    const { data } = await apiClient.put<ApiResponse<ProductSortingConfig>>(
      `/themes/imported/${id}/settings/product-sorting`,
      sorting,
    );
    return data.data;
  },

  async getCartGoals(id: number) {
    const { data } = await apiClient.get<ApiResponse<CartGoal[]>>(
      `/themes/imported/${id}/settings/cart-goals`,
    );
    return data.data;
  },

  async createCartGoal(
    id: number,
    goal: Omit<CartGoal, 'id' | 'imported_theme_id' | 'createdAt' | 'updatedAt'>,
  ) {
    const { data } = await apiClient.post<ApiResponse<CartGoal>>(
      `/themes/imported/${id}/settings/cart-goals`,
      goal,
    );
    return data.data;
  },

  async updateCartGoal(id: number, goalId: number, goal: Partial<CartGoal>) {
    const { data } = await apiClient.put<ApiResponse<CartGoal>>(
      `/themes/imported/${id}/settings/cart-goals/${goalId}`,
      goal,
    );
    return data.data;
  },

  async deleteCartGoal(id: number, goalId: number) {
    const { data } = await apiClient.delete<ApiResponse<null>>(
      `/themes/imported/${id}/settings/cart-goals/${goalId}`,
    );
    return data;
  },
};

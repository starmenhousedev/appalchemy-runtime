import apiClient from '../client';
import type {
  ApiResponse,
  PushNotification,
  AutomatedPush,
  AutomatedPushType,
} from '../../types';

export const pushApi = {
  async list(tab?: 'scheduled' | 'sent' | 'automated') {
    const { data } = await apiClient.get<ApiResponse<any>>(
      '/push-notifications',
      { params: tab ? { tab } : undefined },
    );
    const payload = data?.data;
    if (Array.isArray(payload)) return payload as PushNotification[];
    if (payload && Array.isArray(payload.notifications)) {
      return payload.notifications as PushNotification[];
    }
    return [] as PushNotification[];
  },

  async create(notification: {
    title: string;
    message: string;
    image_url?: string;
    link_url?: string;
    scheduled_at?: string | null;
  }) {
    const { data } = await apiClient.post<ApiResponse<PushNotification>>(
      '/push-notifications',
      notification,
    );
    return data.data;
  },

  async get(id: number) {
    const { data } = await apiClient.get<ApiResponse<PushNotification>>(
      `/push-notifications/${id}`,
    );
    return data.data;
  },

  async update(id: number, updates: Partial<PushNotification>) {
    const { data } = await apiClient.put<ApiResponse<PushNotification>>(
      `/push-notifications/${id}`,
      updates,
    );
    return data.data;
  },

  async delete(id: number) {
    const { data } = await apiClient.delete<ApiResponse<null>>(
      `/push-notifications/${id}`,
    );
    return data;
  },

  async clone(id: number) {
    const { data } = await apiClient.post<ApiResponse<PushNotification>>(
      `/push-notifications/${id}/clone`,
    );
    return data.data;
  },

  async uploadImage(formData: FormData) {
    const { data } = await apiClient.post<ApiResponse<{ url: string }>>(
      '/push-notifications/upload-image',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data.data;
  },

  async send(id: number) {
    const { data } = await apiClient.post<ApiResponse<PushNotification>>(
      '/push-notifications/send',
      { id },
    );
    return data.data;
  },

  async schedule(id: number, scheduled_at: string) {
    const { data } = await apiClient.post<ApiResponse<PushNotification>>(
      '/push-notifications/schedule',
      { id, scheduled_at },
    );
    return data.data;
  },

  // Automated push
  async listAutomated() {
    const { data } = await apiClient.get<ApiResponse<AutomatedPush[]>>(
      '/push-notifications/automated',
    );
    return data.data;
  },

  async updateAutomated(
    type: AutomatedPushType,
    updates: Partial<AutomatedPush>,
  ) {
    const { data } = await apiClient.put<ApiResponse<AutomatedPush>>(
      `/push-notifications/automated/${type}`,
      updates,
    );
    return data.data;
  },

  async toggleAutomated(type: AutomatedPushType) {
    const { data } = await apiClient.put<ApiResponse<AutomatedPush>>(
      `/push-notifications/automated/${type}/toggle`,
    );
    return data.data;
  },
};

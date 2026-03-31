import apiClient from '../client';
import type { ApiResponse, User, UserRole, RolePermissionMap } from '../../types';

export const usersApi = {
  async list() {
    const { data } = await apiClient.get<ApiResponse<User[]>>('/users');
    return data.data;
  },

  async create(user: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }) {
    const { data } = await apiClient.post<ApiResponse<User>>('/users', user);
    return data.data;
  },

  async get(id: number) {
    const { data } = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
    return data.data;
  },

  async update(id: number, updates: Partial<User>) {
    const { data } = await apiClient.put<ApiResponse<User>>(
      `/users/${id}`,
      updates,
    );
    return data.data;
  },

  async delete(id: number) {
    const { data } = await apiClient.delete<ApiResponse<null>>(
      `/users/${id}`,
    );
    return data;
  },

  async getRoles() {
    const { data } = await apiClient.get<ApiResponse<RolePermissionMap>>(
      '/users/roles',
    );
    return data.data;
  },

  async updatePermissions(id: number, permissions: string[]) {
    const { data } = await apiClient.put<ApiResponse<User>>(
      `/users/${id}/permissions`,
      { permissions },
    );
    return data.data;
  },
};

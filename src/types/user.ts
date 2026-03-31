export type UserRole = 'owner' | 'admin' | 'editor' | 'viewer';

export interface User {
  id: number;
  shop_id: number;
  name: string;
  email: string;
  role: UserRole;
  permissions: string[];
  is_active: boolean;
  last_login_at: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RolePermissionMap {
  [role: string]: string[];
}

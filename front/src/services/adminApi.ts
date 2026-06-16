import { API_BASE_URL } from '@/utils/apiConfig';
import { apiFetch } from '@/utils/apiFetch';

export interface StoreItem {
  id: number;
  name: string;
  is_deleted: boolean;
  companies?: Array<{
    codhda: string;
    company?: {
      ihscompany_name: string;
      empresa: string;
      sigla_loja: string;
      cnpj: string;
    };
  }>;
}

export interface CompanyItem {
  ihscompany_id: number;
  codhda: string;
  empresa: string;
  sigla_loja: string;
  cnpj: string;
  ihscompany_name: string;
}

export interface UserItem {
  id: number;
  name: string;
  email: string;
  phone_number: string | null;
  isAdmin: boolean;
  is_deleted?: boolean;
}

export interface PermissionModuleItem {
  id: number;
  name: string;
  key: string;
}

export interface UserPermissionItem {
  id: number;
  module: string;
  name: string;
}

const unwrap = async (res: Response) => {
  const body = await res.json();
  if (!res.ok) throw new Error(body?.message || `Erro ${res.status}`);
  return body.data ?? body;
};

export const fetchStores = async (): Promise<{ items: StoreItem[]; total: number }> => {
  const res = await apiFetch(`${API_BASE_URL}/store/all?page=1&items_per_page=200`);
  return unwrap(res);
};

export const fetchCompanies = async (): Promise<CompanyItem[]> => {
  const res = await apiFetch(`${API_BASE_URL}/store/companies`);
  return unwrap(res);
};

export const createStore = async (name: string, codhdas: string[]): Promise<StoreItem> => {
  const res = await apiFetch(`${API_BASE_URL}/store`, {
    method: 'POST',
    body: JSON.stringify({ name, codhdas }),
  });
  return unwrap(res);
};

export const updateStore = async (id: number, name: string, codhdas: string[]): Promise<StoreItem> => {
  const res = await apiFetch(`${API_BASE_URL}/store/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name, codhdas }),
  });
  return unwrap(res);
};

export const deleteStore = async (id: number): Promise<void> => {
  const res = await apiFetch(`${API_BASE_URL}/store/${id}`, { method: 'DELETE' });
  return unwrap(res);
};

export const fetchUsers = async (): Promise<{ items: UserItem[]; total: number }> => {
  const res = await apiFetch(`${API_BASE_URL}/user?page=1&items_per_page=200`);
  return unwrap(res);
};

export const createUser = async (data: {
  name: string;
  email: string;
  password: string;
  phone_number?: string;
  store_id: number;
}): Promise<UserItem> => {
  const res = await apiFetch(`${API_BASE_URL}/user`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return unwrap(res);
};

export const deleteUser = async (id: number): Promise<void> => {
  const res = await apiFetch(`${API_BASE_URL}/user/${id}`, { method: 'DELETE' });
  return unwrap(res);
};

export const fetchUserPermissions = async (userId: number): Promise<UserPermissionItem[]> => {
  const res = await apiFetch(`${API_BASE_URL}/user/${userId}/permissions`);
  const data = await unwrap(res);
  return data.permissions ?? data ?? [];
};

export const updateUserPermissions = async (
  userId: number,
  permissions: Array<{ module: string; name: string }>
): Promise<void> => {
  const res = await apiFetch(`${API_BASE_URL}/user/${userId}/permissions`, {
    method: 'PUT',
    body: JSON.stringify({ permissions }),
  });
  return unwrap(res);
};

export const fetchPermissionModules = async (): Promise<PermissionModuleItem[]> => {
  const res = await apiFetch(`${API_BASE_URL}/permission-modules?page=1&items_per_page=50`);
  const data = await unwrap(res);
  return data.items ?? data;
};

export const resetUserPassword = async (userId: number, newPassword: string): Promise<void> => {
  const res = await apiFetch(`${API_BASE_URL}/user/${userId}/reset-password`, {
    method: 'PUT',
    body: JSON.stringify({ newPassword }),
  });
  await unwrap(res);
};

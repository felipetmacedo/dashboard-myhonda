import { API_BASE_URL } from '@/utils/apiConfig';
import { LoginRequest, LoginResponse, SessionResponse } from './authTypes';

export const loginUser = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Erro ${response.status}`);
  }

  const json = await response.json();
  return json.data;
};

export const fetchSession = async (token: string): Promise<SessionResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/session`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Sessão inválida');
  }

  const json = await response.json();
  return json.data;
};

export const changePassword = async (
  token: string,
  data: { currentPassword: string; newPassword: string; confirmPassword: string }
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Erro ${response.status}`);
  }
};

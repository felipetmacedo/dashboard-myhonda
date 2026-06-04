
import { LoginRequest, LoginResponse } from './authTypes';

// TODO(auth): login ainda usa o webhook n8n do Sagzap. Migrar para a rota /auth (JWT) da API MyHonda SFS.
const LOGIN_API_URL = 'https://webhook.n8n.sagzap.com.br/webhook/api-dashboard-login';

export const loginUser = async (credentials: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await fetch(LOGIN_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

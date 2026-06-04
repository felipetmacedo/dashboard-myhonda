/**
 * Configuração dinâmica da API baseada no domínio do frontend
 *
 * Regras:
 * - myhonda.sagzap.com.br → API em express-myhonda.sagzap.com.br
 * - localhost / 127.0.0.1 → Usa VITE_API_URL (para desenvolvimento local)
 * - Qualquer outro domínio (preview, etc.) → API em express-myhonda.sagzap.com.br
 */

export const getApiBaseUrl = (): string => {
  const hostname = window.location.hostname;

  // Se está rodando localmente, usa a variável de ambiente
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    const envUrl = import.meta.env.VITE_API_URL || '';
    return envUrl.replace(/\/$/, '');
  }

  // Para produção E qualquer preview remoto, usa a API de produção
  return 'https://express-myhonda.sagzap.com.br';
};

export const API_BASE_URL = getApiBaseUrl();

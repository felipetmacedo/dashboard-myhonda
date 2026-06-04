import { API_BASE_URL } from '@/utils/apiConfig';
import { Lead, LeadsRequest } from './reportsTypes';

export async function fetchLeads(params: LeadsRequest): Promise<Lead[]> {
  const { dataInicio, dataFinal, codhda } = params;
  const qs = new URLSearchParams({ dataInicio, dataFinal, codhda }).toString();

  const response = await fetch(`${API_BASE_URL}/reports/leads?${qs}`);

  if (!response.ok) {
    throw new Error(`Erro ao buscar leads: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();
  return json.data as Lead[];
}

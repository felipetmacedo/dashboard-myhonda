export interface Lead {
  data_criacao_lead: string;
  ID: number;
  CODHDA: string;
  NOME: string;
  CRM_INTEGRACAO: string | null;
  tipo_original: string;
  TIPO: string;
  PRODUTO: string;
  CPF: string;
  CELULAR: string;
  FONE: string;
  EMAIL: string;
  ORIGEM: string;
  SUB_ORIGEM: string;
  JSON_MYHONDA: string | null;
  RETORNO_ENCAMINHAMENTO: string | null;
  MSG_ENVIADA: string | null;
  MSG_ENCAMINHADA: string | null;
  DATA_CADASTRO: string;
  QTD_TENTATIVAS: number;
  lead: string | null;
  perfil: string | null;
  idade: string | null;
  folga_orcamentaria: string | null;
  escolaridade: string | null;
  interesses: string | null;
  comportamento_digital: string | null;
  comportamento_financeiro: string | null;
  versao: string | null;
  ano_modelo: string | null;
  tipo_servico: string | null;
  sla_minutos: number | null;
}

export interface LeadsRequest {
  dataInicio: string;
  dataFinal: string;
  codhda: string;
}

import Database from '../database';
import { QueryTypes } from 'sequelize';

export default class ReportsService {
	constructor() {
		this.database = new Database();
	}

	async leads({ dataInicio, dataFinal, codhda }) {
		const codhdaArray = codhda.split(',').map(c => c.trim()).filter(Boolean);

		const query = `
			SELECT
				ihs_myhonda_integracao.data_criacao_lead,
				ihs_myhonda_integracao.ID,
				ihs_myhonda_integracao.CODHDA,
				ihs_myhonda_integracao.NOME,
				ihs_myhonda_integracao.CRM_INTEGRACAO,
				ihs_myhonda_integracao.TIPO AS tipo_original,
				CASE
					WHEN LOCATE('HDA', ihs_myhonda_integracao.TIPO) > 0 THEN 'HDA'
					WHEN LOCATE('CNH', ihs_myhonda_integracao.TIPO) > 0 THEN 'CNH'
					WHEN LOCATE('SHB', ihs_myhonda_integracao.TIPO) > 0 THEN 'SHB'
					WHEN LOCATE('HSF', ihs_myhonda_integracao.TIPO) > 0 THEN 'HSF'
					WHEN LOCATE('BHB', ihs_myhonda_integracao.TIPO) > 0 THEN 'BHB'
					WHEN LOCATE('HAB', ihs_myhonda_integracao.TIPO) > 0 THEN 'HAB'
					WHEN LOCATE('CS ', ihs_myhonda_integracao.TIPO) > 0 THEN 'CS '
				END AS TIPO,
				ihs_myhonda_integracao.lead,
				ihs_myhonda_integracao.PRODUTO,
				ihs_myhonda_integracao.CPF,
				ihs_myhonda_integracao.CELULAR,
				ihs_myhonda_integracao.FONE,
				ihs_myhonda_integracao.EMAIL,
				ihs_myhonda_integracao.ORIGEM,
				ihs_myhonda_integracao.SUB_ORIGEM,
				ihs_myhonda_integracao.JSON_MYHONDA,
				ihs_myhonda_integracao.RETORNO_ENCAMINHAMENTO,
				ihs_myhonda_integracao.MSG_ENVIADA,
				ihs_myhonda_integracao.MSG_ENCAMINHADA,
				ihs_myhonda_integracao.DATA_CADASTRO,
				ihs_myhonda_integracao.QTD_TENTATIVAS,
				ihs_myhonda_integracao.perfil,
				ihs_myhonda_integracao.idade,
				ihs_myhonda_integracao.folga_orcamentaria,
				ihs_myhonda_integracao.escolaridade,
				ihs_myhonda_integracao.interesses,
				ihs_myhonda_integracao.comportamento_digital,
				ihs_myhonda_integracao.comportamento_financeiro,
				ihs_myhonda_integracao.versao,
				ihs_myhonda_integracao.ano_modelo,
				ihs_myhonda_integracao.tipo_servico,
				TIMESTAMPDIFF(MINUTE,
					ihs_myhonda_integracao.data_criacao_lead,
					IF(
						TIME(ihs_myhonda_integracao.data_criacao_lead) < '08:00:00'
						OR TIME(ihs_myhonda_integracao.data_criacao_lead) >= '18:00:00'
						OR WEEKDAY(ihs_myhonda_integracao.data_criacao_lead) >= 5,
						ihs_myhonda_integracao.data_criacao_lead,
						ihs_myhonda_integracao.DATA_CADASTRO
					)
				) AS sla_minutos
			FROM
				ihs_myhonda_integracao
			WHERE
				(CASE
					WHEN LOCATE('HDA', ihs_myhonda_integracao.TIPO) > 0 THEN 'HDA'
					WHEN LOCATE('CNH', ihs_myhonda_integracao.TIPO) > 0 THEN 'CNH'
					WHEN LOCATE('SHB', ihs_myhonda_integracao.TIPO) > 0 THEN 'SHB'
					WHEN LOCATE('HSF', ihs_myhonda_integracao.TIPO) > 0 THEN 'HSF'
					WHEN LOCATE('BHB', ihs_myhonda_integracao.TIPO) > 0 THEN 'BHB'
					WHEN LOCATE('HAB', ihs_myhonda_integracao.TIPO) > 0 THEN 'HAB'
					WHEN LOCATE('CS ', ihs_myhonda_integracao.TIPO) > 0 THEN 'CS '
				END IN ('HDA', 'CNH', 'HSF', 'SHB', 'BHB', 'HAB', 'CS '))
				AND (ihs_myhonda_integracao.data_criacao_lead BETWEEN :dataInicio AND :dataFinal)
				AND (ihs_myhonda_integracao.CODHDA IN (:codhda))
			GROUP BY
				ihs_myhonda_integracao.CODHDA,
				ihs_myhonda_integracao.CPF,
				ihs_myhonda_integracao.CELULAR,
				Cast(ihs_myhonda_integracao.data_criacao_lead As DATE)
			ORDER BY
				ihs_myhonda_integracao.ID DESC
		`;

		return this.database.masterInstance.query(query, {
			replacements: { dataInicio, dataFinal, codhda: codhdaArray },
			type: QueryTypes.SELECT,
			timeout: 30000,
		});
	}
}

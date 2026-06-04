import * as yup from 'yup';

export default {
	create: {
		body: yup.object().shape({
			cnpj: yup.string().required(),
			name: yup.string().required(),
			razao_social: yup.string().required(),
			nome_fantasia: yup.string().required(),
			inscricao_estadual: yup.string().nullable(),
			inscricao_municipal: yup.string().nullable(),
			email: yup.string().email().required(),
			cep: yup.string().required(),
			address: yup.string().required(),
			number: yup.string().required(),
			complement: yup.string(),
			neighborhood: yup.string().required(),
			city: yup.string().required(),
			state: yup.string().required()
		})
	},
	delete: {
		params: yup.object().shape({
			id: yup.number().required()
		})
	},
	update: {
		params: yup.object().shape({
			id: yup.number().required()
		}),
		body: yup.object().shape({
			name: yup.string(),
			razao_social: yup.string(),
			nome_fantasia: yup.string(),
			inscricao_estadual: yup.string().nullable(),
			inscricao_municipal: yup.string().nullable(),
			email: yup.string().email(),
			cnpj: yup.string(),
			cep: yup.string(),
			address: yup.string(),
			number: yup.string(),
			complement: yup.string(),
			neighborhood: yup.string(),
			city: yup.string(),
			state: yup.string()
		})
	},
	list: {
		query: yup.object().shape({
			page: yup.number().required(),
			items_per_page: yup.number().required()
		})
	}
};

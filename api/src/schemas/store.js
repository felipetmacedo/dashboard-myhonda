import * as yup from 'yup';

export default {
	create: {
		body: yup.object().shape({
			name: yup.string().required(),
			codhdas: yup.array().of(yup.string()).nullable(),
		})
	},
	update: {
		params: yup.object().shape({
			id: yup.number().required()
		}),
		body: yup.object().shape({
			name: yup.string(),
			codhdas: yup.array().of(yup.string()).nullable(),
		})
	},
	delete: {
		params: yup.object().shape({
			id: yup.number().required()
		})
	},
	list: {
		query: yup.object().shape({
			page: yup.number().required(),
			items_per_page: yup.number().required()
		})
	}
};

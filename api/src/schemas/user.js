import { sanitizeValue } from './utils';
import * as yup from 'yup';

export default {
	create: {
		body: yup.object().shape({
			document: yup.string().required(),
			name: yup.string().required(),
			email: yup.string().email().required(),
			phone_number: yup.string().required(),
			cep: yup.string().required(),
			address: yup.string().required(),
			number: yup.string().required(),
			complement: yup.string(),
			neighborhood: yup.string().required(),
			city: yup.string().required(),
			state: yup.string().required()
		})
	},
	find: {
		params: yup.object().shape({
			id: yup.string().transform(sanitizeValue).required()
		})
	},
	getPermissions: {
		params: yup.object().shape({
			id: yup.string().transform(sanitizeValue).required()
		})
	},
	update: {
		params: yup.object().shape({
			id: yup.number().positive().required()
		}),
		body: yup.object().shape({
			document: yup.string().required(),
			name: yup.string().required(),
			email: yup.string().email().required(),
			phone_number: yup.string().required(),
			cep: yup.string().required(),
			address: yup.string().required(),
			number: yup.string().required(),
			complement: yup.string(),
			neighborhood: yup.string().required(),
			city: yup.string().required(),
			state: yup.string().required()
		})
	},
	updateProfile: {
		body: yup.object().shape({
			document: yup.string().required(),
			name: yup.string().required(),
			email: yup.string().email().required(),
			phone_number: yup.string().required(),
			cep: yup.string().required(),
			address: yup.string().required(),
			number: yup.string().required(),
			complement: yup.string(),
			neighborhood: yup.string().required(),
			city: yup.string().required(),
			state: yup.string().required()
		})
	},
	updatePermissions: {
		params: yup.object().shape({
			id: yup.number().positive().required()
		}),
		body: yup.object().shape({
			permissions: yup.array().of(yup.object({
				module: yup.string().required(),
				name: yup.string().required()
			})).required()
		})
	},
	addPermissions: {
		params: yup.object().shape({
			id: yup.number().positive().required()
		}),
		body: yup.object().shape({
			permissions: yup.array().of(yup.object({
				module: yup.string().required(),
				name: yup.string().required()
			})).required()
		})
	},
	removePermission: {
		params: yup.object().shape({
			id: yup.number().positive().required(),
			permissionId: yup.number().positive().required()
		})
	},
	delete: {
		params: yup.object().shape({
			id: yup.number().positive().required()
		})
	},
	list: {
		query: yup.object().shape({
			page: yup.number().positive().required(),
			items_per_page: yup.number().positive().required()
		})
	}
};

import { sanitizeValue } from './utils';
import * as yup from 'yup';

export default {
	create: {
		body: yup.object().shape({
			name: yup.string().required(),
			email: yup.string().email().required(),
			password: yup.string().required(),
			phone_number: yup.string().nullable(),
			document: yup.string().nullable(),
			store_id: yup.number().nullable(),
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
			name: yup.string(),
			email: yup.string().email(),
			phone_number: yup.string().nullable(),
			document: yup.string().nullable(),
		})
	},
	updateProfile: {
		body: yup.object().shape({
			name: yup.string().required(),
			email: yup.string().email().required(),
			phone_number: yup.string().nullable(),
			document: yup.string().nullable(),
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

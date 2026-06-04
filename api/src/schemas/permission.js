import * as yup from 'yup';

export default {
	create: {
		body: yup.object().shape({
			name: yup.string().required(),
			key: yup.string().uppercase().required(),
			permission_module_id: yup.number().positive(),
			permissionModuleId: yup.number().positive(),
		}).test('module-id-required', 'permission_module_id is required', value => Boolean(value?.permission_module_id || value?.permissionModuleId)),
	},
	find: {
		params: yup.object().shape({
			id: yup.number().positive().required(),
		}),
	},
	list: {
		query: yup.object().shape({
			page: yup.number().positive().required(),
			items_per_page: yup.number().positive().required(),
		}),
	},
	update: {
		params: yup.object().shape({
			id: yup.number().positive().required(),
		}),
		body: yup.object().shape({
			name: yup.string(),
			key: yup.string().uppercase(),
			permission_module_id: yup.number().positive(),
			permissionModuleId: yup.number().positive(),
		}),
	},
	delete: {
		params: yup.object().shape({
			id: yup.number().positive().required(),
		}),
	},
};

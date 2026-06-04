import Database from '@database';
import { ExceptionUtils, PaginationUtils } from '@utils';
import { Permission, PermissionModule } from '@models';
import httpStatus from 'http-status';

export default class PermissionService {
	constructor() {
		this.database = new Database();
	}

	async validatePermissionModule(permissionModuleId) {
		const permissionModule = await PermissionModule.findOne({
			where: {
				id: permissionModuleId,
				isDeleted: false,
			},
		});

		if (!permissionModule) {
			throw new ExceptionUtils({
				status: httpStatus.BAD_REQUEST,
				code: 'PERMISSION_MODULE_NOT_FOUND',
				message: 'Permission module not found.',
			});
		}

		return permissionModule;
	}

	async create(data) {
		const permissionModuleId = data.permissionModuleId ?? data.permission_module_id;

		await this.validatePermissionModule(permissionModuleId);

		const existent = await Permission.findOne({
			where: {
				permissionModuleId,
				key: data.key,
				isDeleted: false,
			},
		});

		if (existent) {
			throw new ExceptionUtils({
				status: httpStatus.CONFLICT,
				code: 'PERMISSION_ALREADY_EXISTS',
				message: 'Permission already exists for this module.',
			});
		}

		const permission = await Permission.create({
			name: data.name,
			key: data.key,
			permissionModuleId,
			isDeleted: false,
		});

		return this.find({ id: permission.id });
	}

	async find(filter) {
		const permission = await Permission.findOne({
			where: {
				id: filter.id,
				isDeleted: false,
			},
			include: {
				model: PermissionModule,
				as: 'module',
				required: false,
				where: {
					isDeleted: false,
				},
				attributes: ['id', 'name', 'key'],
			},
			attributes: ['id', 'name', 'key', 'permissionModuleId'],
		});

		if (!permission) {
			throw new ExceptionUtils({
				status: httpStatus.NOT_FOUND,
				code: 'PERMISSION_NOT_FOUND',
				message: 'Permission not found.',
			});
		}

		return permission.get({ plain: true });
	}

	async list(filter) {
		const pagination = PaginationUtils.config({
			page: filter.page,
			items_per_page: filter.items_per_page,
		});

		const [items, total] = await Promise.all([
			Permission.findAll({
				...pagination.getQueryParams(),
				where: {
					isDeleted: false,
				},
				include: {
					model: PermissionModule,
					as: 'module',
					required: false,
					where: {
						isDeleted: false,
					},
					attributes: ['id', 'name', 'key'],
				},
				attributes: ['id', 'name', 'key', 'permissionModuleId'],
				order: [['id', 'ASC']],
			}),
			Permission.count({
				where: {
					isDeleted: false,
				},
			}),
		]);

		return {
			...pagination.mount(total),
			items: items.map(item => item.get({ plain: true })),
		};
	}

	async update(filter, data) {
		const currentPermission = await this.find(filter);
		const permissionModuleId = data.permissionModuleId || data.permission_module_id || currentPermission.permissionModuleId;

		await this.validatePermissionModule(permissionModuleId);

		if (data.key || data.permissionModuleId || data.permission_module_id) {
			const existent = await Permission.findOne({
				where: {
					permissionModuleId,
					key: data.key || currentPermission.key,
					isDeleted: false,
				},
			});

			if (existent && existent.id !== filter.id) {
				throw new ExceptionUtils({
					status: httpStatus.CONFLICT,
					code: 'PERMISSION_ALREADY_EXISTS',
					message: 'Permission already exists for this module.',
				});
			}
		}

		await Permission.update(
			{
				name: data.name,
				key: data.key,
				permissionModuleId,
			},
			{
				where: {
					id: filter.id,
					isDeleted: false,
				},
			}
		);

		return this.find(filter);
	}

	async delete(filter) {
		await this.find(filter);

		await Permission.update(
			{
				isDeleted: true,
			},
			{
				where: {
					id: filter.id,
					isDeleted: false,
				},
			}
		);

		return true;
	}
}

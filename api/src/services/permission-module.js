import Database from '@database';
import { ExceptionUtils, PaginationUtils } from '@utils';
import { PermissionModule, Permission } from '@models';
import httpStatus from 'http-status';

export default class PermissionModuleService {
	constructor() {
		this.database = new Database();
	}

	async create(data) {
		const existent = await PermissionModule.findOne({
			where: {
				key: data.key,
				isDeleted: false,
			},
		});

		if (existent) {
			throw new ExceptionUtils({
				status: httpStatus.CONFLICT,
				code: 'PERMISSION_MODULE_ALREADY_EXISTS',
				message: 'Permission module already exists.',
			});
		}

		const permissionModule = await PermissionModule.create({
			name: data.name,
			key: data.key,
			isDeleted: false,
		});

		return permissionModule.get({ plain: true });
	}

	async find(filter) {
		const permissionModule = await PermissionModule.findOne({
			where: {
				id: filter.id,
				isDeleted: false,
			},
		});

		if (!permissionModule) {
			throw new ExceptionUtils({
				status: httpStatus.NOT_FOUND,
				code: 'PERMISSION_MODULE_NOT_FOUND',
				message: 'Permission module not found.',
			});
		}

		return permissionModule.get({ plain: true });
	}

	async list(filter) {
		const pagination = PaginationUtils.config({
			page: filter.page,
			items_per_page: filter.items_per_page,
		});

		const [items, total] = await Promise.all([
			PermissionModule.findAll({
				...pagination.getQueryParams(),
				where: {
					isDeleted: false,
				},
				order: [['id', 'ASC']],
			}),
			PermissionModule.count({
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
		const permissionModule = await this.find(filter);

		if (data.key && data.key !== permissionModule.key) {
			const existent = await PermissionModule.findOne({
				where: {
					key: data.key,
					isDeleted: false,
				},
			});

			if (existent) {
				throw new ExceptionUtils({
					status: httpStatus.CONFLICT,
					code: 'PERMISSION_MODULE_ALREADY_EXISTS',
					message: 'Permission module key already exists.',
				});
			}
		}

		await PermissionModule.update(
			{
				name: data.name,
				key: data.key,
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

		const usedPermissions = await Permission.count({
			where: {
				permissionModuleId: filter.id,
				isDeleted: false,
			},
		});

		if (usedPermissions > 0) {
			throw new ExceptionUtils({
				status: httpStatus.BAD_REQUEST,
				code: 'PERMISSION_MODULE_IN_USE',
				message: 'Permission module has active permissions and cannot be removed.',
			});
		}

		await PermissionModule.update(
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

import httpStatus from 'http-status';
import { Op } from 'sequelize';

import Database from '@database';
import { ExceptionUtils } from '@utils';
import { UserService } from '@services';
import { LogConstants } from '@constants';
import { UserLog, UserPermission, Permission, PermissionModule } from '@models';

export default class UserPermissionService {
	constructor() {
		this.database = new Database();
		this.userService = new UserService();
	}

	getStoreId(meta = {}) {
		return meta.storeId ; 
	}

	buildPermissionKey(moduleKey, permissionKey) {
		return `${moduleKey}.${permissionKey}`;
	}

	async getPermissionsEntities(permissions = []) {
		if (!permissions.length) {
			return [];
		}

		const moduleKeys = [...new Set(permissions.map(permission => permission.module))];
		const permissionKeys = [...new Set(permissions.map(permission => permission.name))];

		const dbPermissions = await Permission.findAll({
			where: {
				isDeleted: false,
				key: {
					[Op.in]: permissionKeys
				}
			},
			include: {
				model: PermissionModule,
				as: 'module',
				required: true,
				where: {
					isDeleted: false,
					key: {
						[Op.in]: moduleKeys
					}
				},
				attributes: ['id', 'key']
			},
			attributes: ['id', 'key']
		});

		return dbPermissions;
	}

	mountActivePermissionsByModule(permissions) {
		return permissions.reduce((acc, permission) => {
			if (!acc[permission.module]) {
				acc[permission.module] = {};
			}

			acc[permission.module][permission.name] = true;

			return acc;
		}, {});
	}

	checkPermissionsIsValid(permissions, dbPermissions = []) {
		const activePermissionsByModule = this.mountActivePermissionsByModule(permissions);

		const dbPermissionsMap = dbPermissions.reduce((acc, permission) => {
			const key = this.buildPermissionKey(
				permission.module?.key,
				permission.key
			);

			acc[key] = true;

			return acc;
		}, {});

		const hasInvalidPermission = permissions.some(permission => {
			const permissionKey = this.buildPermissionKey(permission.module, permission.name);

			if (!dbPermissionsMap[permissionKey]) {
				return true;
			}

			const hasReadPermission = activePermissionsByModule[permission.module]?.READ;

			if (permission.name !== 'READ' && !hasReadPermission) {
				return true;
			}

			return false;
		});

		if (hasInvalidPermission) {
			throw new ExceptionUtils({
				status: httpStatus.BAD_REQUEST,
				code: 'INVALID_PERMISSION',
				message: 'Invalid user permissions.'
			});
		}

		return true;
	}

	mountPermissionsToCreate({ dbPermissions, filter }) {
		const storeId = filter.storeId ; 

		return dbPermissions.map(permission => ({
			permissionId: permission.id,
			userId: filter.userId,
			storeId,
						creatorId: filter.loggedUserId
		}));
	}

	async validateUserToEdit({ id, meta }) {
		const storeId = this.getStoreId(meta);

		await this.userService.find({ id, storeId });

		return true;
	}

	async validatePermissionsPayload(permissions) {
		if (!permissions?.length) {
			throw new ExceptionUtils({
				status: httpStatus.BAD_REQUEST,
				code: 'INVALID_PERMISSION',
				message: 'Invalid user permissions.'
			});
		}

		const dbPermissions = await this.getPermissionsEntities(permissions);

		this.checkPermissionsIsValid(permissions, dbPermissions);

		return dbPermissions;
	}

	async getUserPermissionsByStore({ id, storeId }) {
		return UserPermission.findAll({
			where: {
				userId: id,
				storeId: storeId,
				isDeleted: false
			},
			attributes: ['id', 'permissionId']
		});
	}

	async list({ id, meta }) {
		await this.validateUserToEdit({ id, meta });

		const storeId = this.getStoreId(meta);

		return this.userService.getPermissions(id, storeId);
	}

	async add({ id, data, meta }) {
		await this.validateUserToEdit({ id, meta });

		const transaction = await this.database.masterInstance.transaction();

		try {
			const storeId = this.getStoreId(meta);
			const dbPermissions = await this.validatePermissionsPayload(data.permissions);
			const currentPermissions = await this.getUserPermissionsByStore({ id, storeId });

			const currentPermissionIds = new Set(currentPermissions.map(permission => permission.permissionId));
			const permissionsToCreate = this.mountPermissionsToCreate({
				dbPermissions: dbPermissions.filter(permission => !currentPermissionIds.has(permission.id)),
				filter: {
					userId: id,
					storeId,
										loggedUserId: meta.loggedUserId
				}
			});

			if (permissionsToCreate.length) {
				await UserPermission.bulkCreate(permissionsToCreate, { transaction });
			}

			await UserLog.create({
				type: LogConstants.UPDATE_USER_PERMISSIONS,
				userId: meta.loggedUserId,
				storeId,
								targetUserId: id
			}, { transaction });

			await transaction.commit();

			return this.userService.getPermissions(id, storeId);
		} catch (error) {
			await transaction.rollback();
			throw error;
		}
	}

	async update({ id, data, meta }) {
		await this.validateUserToEdit({ id, meta });

		const dbPermissions = await this.validatePermissionsPayload(data.permissions);

		const transaction = await this.database.masterInstance.transaction();

		try {
			const storeId = this.getStoreId(meta);

			await UserPermission.update({
				isDeleted: true
			}, {
				where: {
					userId: id,
					isDeleted: false,
					storeId: storeId
				},
				transaction
			});

			const permissionsToCreate = this.mountPermissionsToCreate({
				dbPermissions,
				filter: {
					userId: id,
					storeId,
										loggedUserId: meta.loggedUserId
				}
			});

			await UserPermission.bulkCreate(permissionsToCreate, { transaction });

			await UserLog.create({
				type: LogConstants.UPDATE_USER_PERMISSIONS,
				userId: meta.loggedUserId,
				storeId,
								targetUserId: id
			}, { transaction });

			await transaction.commit();

			return this.userService.getPermissions(id, storeId);
		} catch (error) {
			await transaction.rollback();
			throw error;
		}
	}

	async remove({ id, permissionId, meta }) {
		await this.validateUserToEdit({ id, meta });

		const transaction = await this.database.masterInstance.transaction();

		try {
			const storeId = this.getStoreId(meta);

			await UserPermission.update(
				{
					isDeleted: true
				},
				{
					where: {
						userId: id,
						permissionId,
						storeId: storeId,
						isDeleted: false
					},
					transaction
				}
			);

			await UserLog.create({
				type: LogConstants.UPDATE_USER_PERMISSIONS,
				userId: meta.loggedUserId,
				storeId,
								targetUserId: id
			}, { transaction });

			await transaction.commit();

			return this.userService.getPermissions(id, storeId);
		} catch (error) {
			await transaction.rollback();
			throw error;
		}
	}
}

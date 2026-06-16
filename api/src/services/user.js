import Database from '@database';
import { map } from 'lodash';
import {
	User,
	Member,
	Store,
	UserLog,
	UserPermission,
	Permission,
	PermissionModule,
} from '@models';
import {
	ExceptionUtils,
	Utils,
	EmailTemplates,
	LoggerUtils,
	PaginationUtils,
} from '@utils';
import { LogConstants } from '@constants';
import httpStatus from 'http-status';
import bcryptjs from 'bcryptjs';
import { PermissionConstants } from '@constants';
import { EmailService } from '@services';
import { Op } from 'sequelize';

export default class UserService {
	constructor() {
		this.database = new Database();
		this.emailService = new EmailService();
	}

	mountPermissionsToCreate({ permissions, filter }) {
		return permissions.map((permission) => {
			const permissionId =
				PermissionConstants.PERMISSION_MODULE_ID_BY_NAME[
					permission.module
				]?.[permission.name];

			return {
				permissionId,
				userId: filter.userId,
				storeId: filter.storeId,
				creatorId: filter.loggedUserId,
			};
		});
	}

	async getExistentUser(userEmail) {
		let existentUser = await User.findOne({
			where: {
				email: userEmail,
				is_deleted: false,
			},
			include: {
				model: Member,
				required: false,
				where: {
					isDeleted: false,
				},
				attributes: ['storeId'],
			},
			attributes: [
				'id',
				'name',
				'email',
				'isEmailVerified',
				'password',
				'isAdmin',
			],
		});

		if (!existentUser) {
			return null;
		}

		existentUser = existentUser.get({ plain: true });

		return {
			id: existentUser.id,
			name: existentUser.name,
			email: existentUser.email,
			password: existentUser.password,
			isAdmin: existentUser.isAdmin,
			storeId: existentUser.member?.storeId || null,
			isEmailVerified: existentUser.isEmailVerified,
		};
	}

	async tryCreateLog(data, transaction) {
		try {
			await UserLog.create(data, { transaction });
		} catch (_) { /* user_logs table may not exist */ }
	}

	async find(filter) {
		let user = await User.findOne({
			where: {
				id: filter.id,
				isDeleted: false,
			},
			attributes: ['id', 'name', 'email', 'isAdmin', 'phone_number', 'document'],
		});

		const member = filter.storeId ? await Member.findOne({
			where: { userId: filter.id, storeId: filter.storeId },
		}) : null;

		if (!user) {
			throw new ExceptionUtils({
				status: httpStatus.NOT_FOUND,
				code: 'USER_NOT_FOUND',
				message: 'User not found.',
			});
		}

		user = user.get({ plain: true });

		return {
			id: user.id,
			name: user.name,
			email: user.email,
			isAdmin: user.isAdmin || false,
			phone_number: user.phone_number,
			document: user.document,
			storeId: member?.storeId || null,
		};
	}

	async getInfo(filter) {
		const user = await User.findOne({
			where: { id: filter.id },
			attributes: ['id', 'name', 'email', 'isAdmin'],
		});

		if (!user) {
			throw new ExceptionUtils({
				status: httpStatus.FORBIDDEN,
				code: 'USER_NOT_FOUND',
				message: 'User not found.',
			});
		}

		return user;
	}

	async list(storeId, filter) {
		const pagination = PaginationUtils.config({
			page: filter.page || 1,
			items_per_page: filter.itemsPerPage || 10,
		});

		const queryOptions = pagination.getQueryParams();

		const userWhere = { isDeleted: false };
		const orConditions = [];
		if (filter.name)
			orConditions.push({ name: { [Op.like]: `%${filter.name}%` } });
		if (filter.document)
			orConditions.push({ document: { [Op.like]: `%${filter.document}%` } });
		if (filter.email)
			orConditions.push({ email: { [Op.like]: `%${filter.email}%` } });
		if (filter.phone_number)
			orConditions.push({ phone_number: { [Op.like]: `%${filter.phone_number}%` } });
		if (orConditions.length > 0) userWhere[Op.or] = orConditions;

		const memberWhere = { isDeleted: false };
		if (storeId) memberWhere.storeId = storeId;

		const [users, count] = await Promise.all([
			User.findAll({
				where: userWhere,
				include: [{
					model: Member,
					required: !!storeId,
					where: memberWhere,
					attributes: ['storeId'],
				}],
				order: [['name', 'ASC']],
				attributes: ['id', 'name', 'email', 'isAdmin', 'document', 'phone_number'],
				...queryOptions,
			}),
			User.count({
				where: userWhere,
				include: [{
					model: Member,
					required: !!storeId,
					where: memberWhere,
				}],
			}),
		]);

		const items = map(users, (user) => {
			user = user.get({ plain: true });
			return {
				id: user.id,
				name: user.name,
				email: user.email,
				isAdmin: user.isAdmin,
				document: user.document,
				phone_number: user.phone_number,
			};
		});

		return {
			items,
			...pagination.mount(count),
		};
	}

	async create(data) {
		const transaction = await this.database.masterInstance.transaction();
		const storeId = data.store_id;

		try {
			const existingUser = await User.findOne({
				where: {
					email: data.email,
					isDeleted: false,
				},
			});

			if (existingUser) {
				throw new ExceptionUtils({
					status: httpStatus.BAD_REQUEST,
					code: 'BAD_REQUEST',
					message: 'E-mail já cadastrado',
				});
			}

			const password = data.password || Utils.generateRandomPassword();

			const user = await User.create(
				{
					name: data.name,
					email: data.email,
					password,
					document: data.document,
					isAdmin: false,
					phone_number: data.phone_number,
					isEmailVerified: true,
				},
				{ transaction }
			);

			if (storeId) {
				await Member.create(
					{
						storeId,
						userId: user.id,
						isDeleted: false,
						creatorId: data.logged_user_id || user.id,
					},
					{ transaction }
				);
			}

			await this.tryCreateLog({
				type: LogConstants.CREATE_USER,
				userId: data.logged_user_id || user.id,
				storeId: storeId || 0,
				targetUserId: user.id,
			}, transaction);

			if (data.defaultPermissions?.length) {
				await UserPermission.bulkCreate(data.defaultPermissions, { transaction });
			}

			if (data.sendEmail !== false) {
				const emailOptions = {
					to: data.email,
					subject: 'Bem-vindo ao SAGzap myHonda - Suas Credenciais de Acesso',
					text: 'Bem-vindo ao SAGzap myHonda',
					html: EmailTemplates.getWelcomeEmailTemplate(user.name, data.email, password),
				};
				await this.emailService.send(emailOptions).catch(() => {});
			}

			await transaction.commit();

			return this.find({ id: user.id });
		} catch (error) {
			LoggerUtils.error('Error creating user', error);
			await transaction.rollback();
			throw error;
		}
	}

	async delete({ id, meta }) {
		const transaction = await this.database.masterInstance.transaction();

		try {
			await User.update(
				{ isDeleted: true },
				{ where: { id, isDeleted: false }, transaction }
			);

			if (meta.storeId) {
				await Member.update(
					{ isDeleted: true },
					{ where: { storeId: meta.storeId, userId: id, isDeleted: false }, transaction }
				);
			}

			await this.tryCreateLog({
				type: LogConstants.DELETE_USER,
				userId: meta.loggedUserId,
				storeId: meta.storeId || 0,
				targetUserId: id,
			}, transaction);

			await transaction.commit();

			return true;
		} catch (error) {
			await transaction.rollback();
			throw error;
		}
	}

	async updateProfile({ id, data }) {
		await User.update(
			{
				name: data.name,
				email: data.email,
				document: data.document,
				phone_number: data.phone_number,
			},
			{ where: { id, isDeleted: false } }
		);

		return this.find({ id });
	}

	async update({ id, data, meta }) {
		const transaction = await this.database.masterInstance.transaction();

		try {
			await User.update(
				{
					name: data.name,
					email: data.email,
					document: data.document,
					phone_number: data.phone_number,
				},
				{ where: { id, isDeleted: false }, transaction }
			);

			await this.tryCreateLog({
				type: LogConstants.UPDATE_USER,
				userId: meta.loggedUserId || id,
				storeId: meta.storeId || 0,
				targetUserId: id,
			}, transaction);

			await transaction.commit();

			return this.find({ id });
		} catch (error) {
			await transaction.rollback();
			throw error;
		}
	}

	mountUserPermission(permission) {
		return {
			id: permission.id,
			name: permission?.permission?.key,
			module: permission?.permission?.module?.key,
		};
	}

	async info(filter) {
		const user = await User.findOne({
			where: { id: filter.id, isDeleted: false },
			include: [
				{
					model: Member,
					required: false,
					where: filter.storeId ? { userId: filter.id, storeId: filter.storeId, isDeleted: false } : { userId: filter.id, isDeleted: false },
					attributes: ['id'],
					include: {
						model: Store,
						attributes: ['id', 'name'],
						required: false,
					},
				},
				{
					model: UserPermission,
					where: filter.storeId ? { storeId: filter.storeId, userId: filter.id, isDeleted: false } : { userId: filter.id, isDeleted: false },
					required: false,
					attributes: ['id'],
					as: 'permissions',
					include: {
						model: Permission,
						where: { isDeleted: false },
						required: false,
						attributes: ['key'],
						include: {
							model: PermissionModule,
							as: 'module',
							where: { isDeleted: false },
							required: false,
							attributes: ['key'],
						},
					},
				},
			],
			attributes: ['id', 'name', 'email', 'isAdmin', 'phone_number', 'document'],
		});

		if (!user) return null;

		user = user.get({ plain: true });

		return {
			id: user.id,
			name: user.name,
			email: user.email,
			phone_number: user.phone_number,
			document: user.document,
			isAdmin: user.isAdmin,
			store: {
				id: user?.member?.store?.id || null,
				name: user?.member?.store?.name || null,
			},
			permissions: map(user.permissions, p => this.mountUserPermission(p)),
		};
	}

	async getPermissions(id, storeId) {
		const user = await User.findOne({
			where: { id },
			attributes: ['id', 'name', 'email'],
		});

		if (!user) return { permissions: [] };

		const where = { userId: id, isDeleted: false };
		if (storeId) where.storeId = storeId;

		const permissions = await UserPermission.findAll({
			where,
			include: {
				model: Permission,
				where: { isDeleted: false },
				required: false,
				attributes: ['key'],
				include: {
					model: PermissionModule,
					as: 'module',
					where: { isDeleted: false },
					required: false,
					attributes: ['key'],
				},
			},
		});

		return {
			userId: id,
			permissions: map(permissions, p => this.mountUserPermission(p)),
		};
	}

	async getMemberIdForUser(userId, storeId) {
		const member = await Member.findOne({
			where: { userId, storeId, isDeleted: false },
		});

		if (!member) {
			throw new ExceptionUtils({
				status: httpStatus.NOT_FOUND,
				code: 'MEMBER_NOT_FOUND',
				message: 'User is not a member of the specified team',
			});
		}

		return member.id;
	}
}

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
	Address,
	Request,
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
					is_deleted: false,
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

	async createTeamUser(data, transactionOptions = {}) {
		const transactionToUse =
			transactionOptions.transaction ||
			(await this.database.masterInstance.transaction());
		const shouldCommit = !transactionOptions.transaction;
		const storeId = data.store_id ; 

		try {
			let user = await User.findOne({
				where: {
					email: data.email,
					is_deleted: false,
				},
			});

			if (user) {
				const existingMember = await Member.findOne({
					where: {
						storeId: storeId,
						userId: user.id,
						isDeleted: false,
					},
				});

				if (existingMember) {
					throw new ExceptionUtils({
						status: httpStatus.CONFLICT,
						code: 'USER_ALREADY_EXISTS',
						message: 'User is already a member of this team',
					});
				}

				const password = data.password
					? bcryptjs.hashSync(data.password, 10)
					: null;

				await User.update(
					{
						name: data.name,
						email: data.email,
						document: data.document,
						address_id: data.address_id,
						password,
						is_deleted: false,
					},
					{ where: { id: user.id }, transaction: transactionToUse }
				);

				if (password) {
					await UserLog.create(
						{
							type: LogConstants.UPDATE_USER,
							userId: user.id,
							storeId: storeId,
							targetUserId: user.id,
						},
						{ transaction: transactionToUse }
					);
				}
			} else {
				user = await User.create(
					{
						name: data.name,
						email: data.email,
						document: data.document,
						address_id: data.address_id,
						password: data.password,
						is_deleted: false,
					},
					{ transaction: transactionToUse }
				);
			}

			const member = await Member.create(
				{
					storeId: storeId,
					userId: user.id,
					isDeleted: false,
					creatorId: data.logged_user_id,
				},
				{ transaction: transactionToUse }
			);

			const defaultPermissions = [
				// Users module permissions
				{
					permissionId:
						PermissionConstants.PERMISSION_MODULE_ID_BY_NAME.USERS
							.READ,
					userId: user.id,
					storeId: storeId,
					creatorId: data.logged_user_id || user.id,
				},
				{
					permissionId:
						PermissionConstants.PERMISSION_MODULE_ID_BY_NAME.USERS
							.CREATE,
					userId: user.id,
					storeId: storeId,
					creatorId: data.logged_user_id || user.id,
				},
				{
					permissionId:
						PermissionConstants.PERMISSION_MODULE_ID_BY_NAME.USERS
							.UPDATE,
					userId: user.id,
					storeId: storeId,
					creatorId: data.logged_user_id || user.id,
				},
				{
					permissionId:
						PermissionConstants.PERMISSION_MODULE_ID_BY_NAME.USERS
							.DELETE,
					userId: user.id,
					storeId: storeId,
					creatorId: data.logged_user_id || user.id,
				},
				{
					permissionId:
						PermissionConstants.PERMISSION_MODULE_ID_BY_NAME.STORES
							.READ,
					userId: user.id,
					storeId: storeId,
					creatorId: data.logged_user_id || user.id,
				},
				{
					permissionId:
						PermissionConstants.PERMISSION_MODULE_ID_BY_NAME.STORES
							.CREATE,
					userId: user.id,
					storeId: storeId,
					creatorId: data.logged_user_id || user.id,
				},
				{
					permissionId:
						PermissionConstants.PERMISSION_MODULE_ID_BY_NAME.STORES
							.UPDATE,
					userId: user.id,
					storeId: storeId,
					creatorId: data.logged_user_id || user.id,
				},
				{
					permissionId:
						PermissionConstants.PERMISSION_MODULE_ID_BY_NAME.STORES
							.DELETE,
					userId: user.id,
					storeId: storeId,
					creatorId: data.logged_user_id || user.id,
				},
			];

			await UserPermission.bulkCreate(defaultPermissions, {
				transaction: transactionToUse,
			});

			await UserLog.create(
				{
					type: LogConstants.CREATE_USER,
					userId: data.logged_user_id || user.id,
					storeId: storeId,
					targetUserId: user.id,
				},
				{ transaction: transactionToUse }
			);

			if (shouldCommit) {
				await transactionToUse.commit();
			}

			return user;
		} catch (error) {
			if (shouldCommit) {
				await transactionToUse.rollback();
			}
			LoggerUtils.error('Error in createTeamUser:', error);
			throw error;
		}
	}

	async find(filter, options) {
		let user = await User.findOne({
			where: {
				id: filter.id,
				isDeleted: false,
			},
			attributes: [
				'id',
				'name',
				'email',
				'isAdmin',
				'phone_number',
				'document',
				'address_id',
				...(options?.extra_attributes || []),
			],
			include: [
				{
					model: Address,
					as: 'address',
					required: false,
					attributes: [
						'address',
						'number',
						'complement',
						'neighborhood',
						'city',
						'state',
						'cep',
					],
				},
			],
		});

		const member = await Member.findOne({
			where: {
				userId: filter.id,
				storeId: filter.storeId,
			},
		});

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
			password: user.password || null,
			isAdmin: user.isAdmin || false,
			phone_number: user.phone_number,
			address: user.address,
			number: user.number,
			complement: user.complement,
			neighborhood: user.neighborhood,
			city: user.city,
			state: user.state,
			cep: user.cep,
			document: user.document,
			storeId: member?.storeId || null,};
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

	async getUpdateActionUsers(id, meta) {
		const options = {
			editor: {
				filter: { id: meta.loggedUserId || id, storeId: meta.storeId },
			},
			user: {
				filter: { id, storeId: meta.storeId },
				options: { extra_attributes: ['password'] },
			},
		};

		const { editor, user } = options;

		const [editorUser, userToEdit] = await Promise.all([
			this.find(editor.filter, editor.options),
			this.find(user.filter, user.options),
		]);

		return { editor: editorUser, user: userToEdit };
	}

	validateCanChangePassword({ data, user, editor }) {
		const isSameUser = user.id === editor.id;
		const isTryingToChangePassword = data.oldPassword && data.newPassword;

		if (!isSameUser && isTryingToChangePassword) {
			throw new ExceptionUtils({
				status: httpStatus.UNAUTHORIZED,
				code: 'NOT_PERMISSION',
				message:
					"You do not have permission to change another user's password.",
			});
		}

		return true;
	}

	validateIsOldPasswordValid({ data, user }) {
		const isValidPassword =
			(data.oldPassword &&
				bcryptjs.compareSync(data.oldPassword, user.password)) ||
			false;

		if (data.newPassword && !isValidPassword) {
			throw new ExceptionUtils({
				status: httpStatus.UNAUTHORIZED,
				code: 'INVALID_PASSWORD',
				message: 'Invalid user password.',
			});
		}

		return true;
	}

	async validateIsEmailChangeValid({ data, user }) {
		const isChangingEmail = user.email !== data.email;

		if (data.email && isChangingEmail) {
			const user = await this.getExistentUser(data.email);

			if (user) {
				throw new ExceptionUtils({
					status: httpStatus.CONFLICT,
					code: 'USER_ALREADY_EXISTS',
					message: 'User already exists.',
				});
			}
		}

		return true;
	}

	valiteIsNewPasswordValid({ data }) {
		const isChangingPassword = data.oldPassword && data.newPassword;

		if (!isChangingPassword) {
			return true;
		}

		const isSamePassword =
			data.newPassword && data.oldPassword === data.newPassword;

		if (isSamePassword) {
			throw new ExceptionUtils({
				status: httpStatus.BAD_REQUEST,
				code: 'SAME_PASSWORD',
				message:
					'New password must be different from the old password.',
			});
		}

		return true;
	}

	async validateUserUpdate({ id, data, meta }) {
		const { editor, user } = await this.getUpdateActionUsers(id, meta);

		await this.validateIsEmailChangeValid({ data, user });

		this.validateCanChangePassword({ data, user, editor });
		this.validateIsOldPasswordValid({ data, user });
		this.valiteIsNewPasswordValid({ data });

		return true;
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
			orConditions.push({ name: { [Op.iLike]: `%${filter.name}%` } });
		if (filter.document)
			orConditions.push({
				document: { [Op.iLike]: `%${filter.document}%` },
			});
		if (filter.email)
			orConditions.push({ email: { [Op.iLike]: `%${filter.email}%` } });
		if (filter.phone_number)
			orConditions.push({
				phone_number: { [Op.iLike]: `%${filter.phone_number}%` },
			});
		if (orConditions.length > 0) userWhere[Op.or] = orConditions;

		let promisses = [];
		promisses.push(
			User.findAll({
				where: userWhere,
				include: [
					{
						model: Address,
						as: 'address',
						required: false,
						attributes: [
							'address',
							'number',
							'complement',
							'neighborhood',
							'city',
							'state',
							'cep',
						],
					},
					{
						model: Member,
						required: true,
						where: {
							storeId,
							isDeleted: false,
						},
						attributes: ['storeId'],
					},
				],
				order: [['name', 'ASC']],
				attributes: [
					'id',
					'name',
					'email',
					'isAdmin',
					'document',
					'phone_number',
				],
				...queryOptions,
			})
		);

		promisses.push(
			User.count({
				where: userWhere,
				include: [
					{
						model: Member,
						required: true,
						where: {
							storeId,
							isDeleted: false,
						},
					},
				],
			})
		);

		const [users, count] = await Promise.all(promisses);

		const items = map(users, (user) => {
			user = user.get({ plain: true });
			return {
				id: user.id,
				name: user.name,
				email: user.email,
				document: user.document,
				phone_number: user.phone_number,
				address: user.address?.address,
				number: user.address?.number,
				complement: user.address?.complement,
				neighborhood: user.address?.neighborhood,
				city: user.address?.city,
				state: user.address?.state,
				cep: user.address?.cep,
			};
		});

		return {
			items,
			...pagination.mount(count),
		};
	}

	async updateProfile({ id, data }) {
		const transaction = await this.database.masterInstance.transaction();

		try {
			const user = await User.findOne({
				where: {
					id,
					isDeleted: false,
				},
				attributes: ['id', 'address_id'],
				include: {
					model: Member,
					required: false,
					where: {
						isDeleted: false,
					},
					attributes: ['storeId'],
				},
			});

			if (!user) {
				throw new ExceptionUtils({
					status: httpStatus.NOT_FOUND,
					code: 'USER_NOT_FOUND',
					message: 'User not found.',
				});
			}

			await Address.update(
				{
					cep: data.cep,
					address: data.address,
					number: data.number,
					complement: data.complement,
					neighborhood: data.neighborhood,
					city: data.city,
					state: data.state,
				},
				{ where: { id: user.address_id }, transaction }
			);

			await User.update(
				{
					name: data.name,
					email: data.email,
					document: data.document,
					phone_number: data.phone_number,
				},
				{
					where: {
						id,
						isDeleted: false,
					},
					transaction,
					returning: true,
					raw: true,
				}
			);

			await UserLog.create(
				{
					type: LogConstants.UPDATE_USER,
					userId: id,
					storeId: user.member.storeId,
					targetUserId: id,
				},
				{ transaction }
			);

			await transaction.commit();

			return this.find({ id });
		} catch (error) {
			await transaction.rollback();
			throw error;
		}
	}

	async update({ id, data, meta }) {
		await this.validateUserUpdate({ id, data, meta });

		const transaction = await this.database.masterInstance.transaction();

		try {
			const user = await User.findOne({
				where: {
					id,
					isDeleted: false,
				},
				attributes: ['id', 'address_id'],
			});

			if (!user) {
				throw new ExceptionUtils({
					status: httpStatus.NOT_FOUND,
					code: 'USER_NOT_FOUND',
					message: 'User not found.',
				});
			}

			await Address.update(
				{
					cep: data.cep,
					address: data.address,
					number: data.number,
					complement: data.complement,
					neighborhood: data.neighborhood,
					city: data.city,
					state: data.state,
				},
				{ where: { id: user.address_id }, transaction }
			);

			await UserLog.create(
				{
					type: LogConstants.UPDATE_USER,
					userId: meta.loggedUserId || id,
					storeId: meta.storeId,
					targetUserId: id,
				},
				{ transaction }
			);

			await transaction.commit();

			return this.find({ id });
		} catch (error) {
			await transaction.rollback();
			throw error;
		}
	}

	async delete({ id, meta }) {
		const transaction = await this.database.masterInstance.transaction();

		try {
			const member = await Member.findOne({
				where: {
					storeId: meta.storeId,
					userId: meta.loggedUserId,
				},
			});

			if (!member) {
				throw new ExceptionUtils({
					status: httpStatus.NOT_FOUND,
					code: 'MEMBER_NOT_FOUND',
					message: 'User is not a member of the specified team',
				});
			}

			const memberToDelete = await Member.findOne({
				where: {
					storeId: meta.storeId,
					userId: id,
				},
			});

			if (!memberToDelete) {
				throw new ExceptionUtils({
					status: httpStatus.NOT_FOUND,
					code: 'MEMBER_NOT_FOUND',
					message: 'User is not a member of the specified team',
				});
			}

			await User.update(
				{
					isDeleted: true,
				},
				{
					where: {
						id,
						isDeleted: false,
					},
					transaction,
				}
			);

			await Member.update(
				{
					isDeleted: true,
					destroyerId: meta.loggedUserId,
				},
				{
					where: {
						storeId: meta.storeId,
						userId: id,
						isDeleted: false,
					},
					transaction,
				}
			);

			await UserLog.create(
				{
					type: LogConstants.DELETE_USER,
					userId: meta.loggedUserId,
					storeId: meta.storeId,
					targetUserId: id,
				},
				{ transaction }
			);

			await transaction.commit();

			return true;
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

	getParsedUserInfoUser(user) {
		user = user.get({ plain: true });

		return {
			id: user.id,
			name: user.name,
			email: user.email,
			phone_number: user.phone_number,
			document: user.document,
			cep: user.address?.cep,
			number: user.address?.number,
			complement: user.address?.complement,
			neighborhood: user.address?.neighborhood,
			city: user.address?.city,
			state: user.address?.state,
			address: user.address?.address,
			isAdmin: user.isAdmin,
			store: {
				id: user?.member?.store?.id || null,
				name: user?.member?.store?.name || null,
				cnpj: user?.member?.store?.cnpj || null,
				email: user?.member?.store?.email || null,
			},
			permissions: map(user.permissions, permission =>
				this.mountUserPermission(permission)
			),
		};
	}

	async info(filter) {
		const user = await User.findOne({
			where: {
				id: filter.id,
				isDeleted: false,
			},
			include: [
				{
					model: Address,
					attributes: [
						'address',
						'number',
						'complement',
						'neighborhood',
						'city',
						'state',
						'cep',
					],
				},
				{
					model: Member,
					required: false,
					where: {
						userId: filter.id,
						storeId: filter.storeId,
						isDeleted: false,
					},
					attributes: ['id'],
					include: {
						model: Store,
						attributes: ['id', 'name', 'cnpj', 'email'],
						required: false,
					},
				},
				{
					model: UserPermission,
					where: {
						storeId: filter.storeId,
						userId: filter.id,
						isDeleted: false,
					},
					required: false,
					attributes: ['id'],
					as: 'permissions',
					include: {
						model: Permission,
						where: {
							isDeleted: false,
						},
						required: false,
						attributes: ['key'],
						include: {
							model: PermissionModule,
							as: 'module',
							where: {
								isDeleted: false,
							},
							required: false,
							attributes: ['key'],
						},
					},
				},
			],
			attributes: [
				'id',
				'name',
				'email',
				'isAdmin',
				'phone_number',
				'document',
			],
		});

		if (!user) {
			return null;
		}

		const parsedUser = this.getParsedUserInfoUser(user);

		return parsedUser;
	}

	async getPermissions(id, storeId) {
		const user = await User.findOne({
			where: { id },
			attributes: ['id', 'name', 'email'],
		});

		if (!user) {
			return {
				permissions: [],
			};
		}

		const member = await Member.findOne({
			where: {
				userId: id,
				storeId: storeId,
				isDeleted: false,
			},
			attributes: ['id'],
		});

		if (!member) {
			return {
				userId: id,
				permissions: [],
			};
		}

		const permissions = await UserPermission.findAll({
			where: {
				userId: id,
				storeId: storeId,
				isDeleted: false,
			},
			include: {
				model: Permission,
				where: {
					isDeleted: false,
				},
				required: false,
				attributes: ['key'],
				include: {
					model: PermissionModule,
					as: 'module',
					where: {
						isDeleted: false,
					},
					required: false,
					attributes: ['key'],
				},
			},
		});

		return {
			userId: id,
			permissions: map(permissions, (permission) =>
				this.mountUserPermission(permission)
			),
		};
	}

	async create(data) {
		const transaction = await this.database.masterInstance.transaction();
		const storeId = data.store_id;

		try {
			const existingUser = await User.findOne({
				where: {
					document: data.document,
					email: data.email,
					is_deleted: false,
				},
			});

			if (existingUser) {
				throw new ExceptionUtils({
					status: httpStatus.BAD_REQUEST,
					code: 'BAD_REQUEST',
					message: 'CNPJ já cadastrado',
				});
			}

			const address = await Address.create(
				{
					cep: data.cep,
					address: data.address,
					number: data.number,
					complement: data.complement,
					neighborhood: data.neighborhood,
					city: data.city,
					state: data.state,
				},
				{ transaction }
			);

			const password = Utils.generateRandomPassword();

			const user = await User.create(
				{
					name: data.name,
					email: data.email,
					password,
					document: data.document,
					isAdmin: false,
					phone_number: data.phone_number,
					address_id: address.id,
					isEmailVerified: true,
				},
				{ transaction }
			);

			const member = await Member.create(
				{
					storeId: storeId,
					userId: user.id,
					isDeleted: false,
					creatorId: data.logged_user_id,
				},
				{ transaction }
			);

			await UserLog.create(
				{
					type: LogConstants.CREATE_USER,
					userId: user.id,
					storeId: storeId,
					targetUserId: user.id,
				},
				{ transaction }
			);

			const defaultPermissions = [
				// Users module permissions
				{
					permissionId:
						PermissionConstants.PERMISSION_MODULE_ID_BY_NAME
							.USERS.READ,
					userId: user.id,
					storeId: storeId,
					creatorId: data.logged_user_id || user.id,
				},
				{
					permissionId:
						PermissionConstants.PERMISSION_MODULE_ID_BY_NAME
							.USERS.CREATE,
					userId: user.id,
					storeId: storeId,
					creatorId: data.logged_user_id || user.id,
				},
				{
					permissionId:
						PermissionConstants.PERMISSION_MODULE_ID_BY_NAME
							.USERS.UPDATE,
					userId: user.id,
					storeId: storeId,
					creatorId: data.logged_user_id || user.id,
				},
				{
					permissionId:
						PermissionConstants.PERMISSION_MODULE_ID_BY_NAME
							.USERS.DELETE,
					userId: user.id,
					storeId: storeId,
					creatorId: data.logged_user_id || user.id,
				},
				{
					permissionId:
						PermissionConstants.PERMISSION_MODULE_ID_BY_NAME
							.STORES.READ,
					userId: user.id,
					storeId: storeId,
					creatorId: data.logged_user_id || user.id,
				},
			];

			await UserPermission.bulkCreate(defaultPermissions, {
				transaction,
			});

			const emailOptions = {
				to: data.email,
				subject: 'Bem-vindo ao SIG - Suas Credenciais de Acesso',
				text: 'Bem-vindo ao SIG - Suas Credenciais de Acesso',
				html: EmailTemplates.getWelcomeEmailTemplate(
					user.name,
					data.email,
					password
				),
			};

			await this.emailService.send(emailOptions);

			await transaction.commit();

			return this.find({ id: user.id });
		} catch (error) {
			LoggerUtils.error('Error creating user', error);
			await transaction.rollback();
			throw error;
		}
	}

	async getMemberIdForUser(userId, storeId) {
		const member = await Member.findOne({
			where: {
				userId,
				storeId,
				isDeleted: false,
			},
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

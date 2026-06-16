import bcryptjs from 'bcryptjs';
import { pick } from 'lodash';
import httpStatus from 'http-status';
import Database from '@database';
import { UserService, EmailService } from '@services';
import { AuthUtils, ExceptionUtils, LoggerUtils, EmailTemplates } from '@utils';
import { User, UserRecoverPassword, Member, Store, StoreCompany, IhsCompany, UserPermission, Permission, PermissionModule } from '@models';
import config from '../config/config';
import { Op } from 'sequelize';

export default class AuthService {
	constructor() {
		this.database = new Database();
		this.userService = new UserService();
		this.emailService = new EmailService();
	}

	async loadUserAccess(userId, isAdmin) {
		try {
			if (isAdmin) {
				let companies = [];
				try {
					companies = await IhsCompany.findAll({
						where: { ativa: 1 },
						attributes: ['codhda', 'empresa', 'sigla_loja'],
						raw: true
					});
				} catch (_) { /* ihs_companies might be unavailable */ }

				return {
					codhdaList: companies.map(c => String(c.codhda)),
					lojas: companies.map(c => ({
						codhda: c.codhda,
						empresa: c.empresa,
						sigla_loja: c.sigla_loja
					})),
					permissions: [],
					store: null
				};
			}

			let members = [];
			try {
				members = await Member.findAll({
					where: { userId, isDeleted: false },
					include: [{
						model: Store,
						required: false,
						where: { is_deleted: false },
						attributes: ['id', 'name'],
						include: [{
							model: StoreCompany,
							as: 'companies',
							required: false,
							include: [{
								model: IhsCompany,
								as: 'company',
								required: false,
								attributes: ['codhda', 'empresa', 'sigla_loja']
							}]
						}]
					}]
				});
			} catch (_) { /* members/stores might differ */ }

			let store = null;
			const lojasMap = new Map();

			for (const m of members) {
				if (!store && m.store) {
					store = { id: m.store.id, name: m.store.name };
				}
				if (m.store?.companies?.length) {
					for (const sc of m.store.companies) {
						if (sc.company) {
							lojasMap.set(String(sc.company.codhda), {
								codhda: sc.company.codhda,
								empresa: sc.company.empresa,
								sigla_loja: sc.company.sigla_loja
							});
						}
					}
				}
			}

			const codhdaList = [...lojasMap.keys()];
			const lojas = [...lojasMap.values()];

			let userPerms = [];
			try {
				userPerms = await UserPermission.findAll({
					where: { userId, isDeleted: false },
					include: [{
						model: Permission,
						include: [{ model: PermissionModule, as: 'module' }]
					}]
				});
			} catch (_) { /* permissions table might differ */ }

			let permissions = userPerms
				.filter(up => up.permission && up.permission.module)
				.map(up => `${up.permission.module.key}.${up.permission.key}`)
				.filter((v, i, arr) => arr.indexOf(v) === i);

			if (permissions.length === 0) {
				try {
					const modules = await PermissionModule.findAll({
						where: { isDeleted: false },
						attributes: ['key'],
						raw: true
					});
					permissions = modules.map(m => `${m.key}.READ`);
				} catch (_) { /* permission modules table might differ */ }
			}

			return { codhdaList, lojas, permissions, store };
		} catch (error) {
			LoggerUtils.error('loadUserAccess error:', error);
			return { codhdaList: [], lojas: [], permissions: [], store: null };
		}
	}

	async getSession(userId) {
		const user = await User.findOne({
			where: { id: userId, isDeleted: false },
			attributes: ['id', 'name', 'email', 'isAdmin']
		});

		if (!user) {
			throw new ExceptionUtils({
				status: httpStatus.NOT_FOUND,
				code: 'USER_NOT_FOUND',
				message: 'User not found'
			});
		}

		const access = await this.loadUserAccess(user.id, user.isAdmin);

		return {
			user: pick(user.get({ plain: true }), ['id', 'name', 'email', 'isAdmin']),
			store: access.store,
			lojas: access.lojas,
			codhdaList: access.codhdaList,
			permissions: access.permissions
		};
	}

	async changePassword({ currentPassword, newPassword }, userId) {
		const user = await User.findOne({
			where: { id: userId, isDeleted: false },
			attributes: ['id', 'password']
		});

		if (!user) {
			throw new ExceptionUtils({
				status: httpStatus.NOT_FOUND,
				code: 'USER_NOT_FOUND',
				message: 'Usuário não encontrado'
			});
		}

		const isValid = bcryptjs.compareSync(currentPassword, user.password);
		if (!isValid) {
			throw new ExceptionUtils({
				status: httpStatus.UNAUTHORIZED,
				code: 'INVALID_CREDENTIALS',
				message: 'Senha atual incorreta'
			});
		}

		const hashed = bcryptjs.hashSync(newPassword, 10);
		await User.update({ password: hashed }, { where: { id: userId } });
		return true;
	}

	async resetUserPassword({ userId, newPassword }) {
		const user = await User.findOne({
			where: { id: userId, isDeleted: false },
			attributes: ['id']
		});

		if (!user) {
			throw new ExceptionUtils({
				status: httpStatus.NOT_FOUND,
				code: 'USER_NOT_FOUND',
				message: 'Usuário não encontrado'
			});
		}

		const hashed = bcryptjs.hashSync(newPassword, 10);
		await User.update({ password: hashed }, { where: { id: userId } });
		return true;
	}

	async login({ email, password }) {
		let isFakeUser = false;
		const FAKE_PASSWORD = '$2a$10$4NNIgYdnWkr4B30pT5i3feDEzWivfxyOK.oNSxk7G3GzGAVfB6vEC';

		let user = await this.userService.getExistentUser(email);

		if (!user) {
			isFakeUser = true;

			user = {
				id: 1,
				password: FAKE_PASSWORD
			};
		}

		const isValidPassword = bcryptjs.compareSync(password, user.password);

		if (!isValidPassword || isFakeUser) {
			throw new ExceptionUtils({
				status: httpStatus.UNAUTHORIZED,
				code: 'INVALID_CREDENTIALS',
				message: 'Invalid credentials'
			});
		}

		const access = await this.loadUserAccess(user.id, user.isAdmin);

		return AuthUtils.getTokenData({
			...pick(user, ['id', 'name', 'email', 'isAdmin']),
			codhdaList: access.codhdaList,
			lojas: access.lojas,
			permissions: access.permissions,
		});
	}

	async register(data) {
		const existingUser = await User.findOne({
			where: {
				[Op.or]: [
					{ email: data.email },
					{ document: data.document_number }
				],
				isDeleted: false
			},
			raw: true
		});

		if (existingUser) {
			throw new ExceptionUtils({
				status: httpStatus.UNAUTHORIZED,
				code: 'USER_ALREADY_EXISTS',
				message: 'Já existe um usuário com este email ou CPF.',
			});
		}

		const transaction = await this.database.masterInstance.transaction();

		try {
			await User.create(
				{
					name: data.name,
					email: data.email,
					password: data.password,
					isEmailVerified: true,
					phone_number: data.phone_number,
					document: data.document_number,
				},
				{ transaction }
			);

			await transaction.commit();

			return true;
		} catch (error) {
			await transaction.rollback();
			LoggerUtils.error('Error in register:', error);
			throw error;
		}
	}

	async sendVerificationEmail(user) {
		const { token } = await AuthUtils.getTokenData(pick(user, ['id', 'name', 'email', 'isAdmin']));

		const emailOptions = {
			to: user.email,
			from: config.email.from,
			subject: 'Account Verification',
			text: `To verify your account, click on the link: ${config.client.baseUrl}/verify-email/${token}`,
			html: `To verify your account, click on the link: <a href="${config.client.baseUrl}/verify-email/${token}">Verify Account</a>`
		};

		this.emailService.send(emailOptions);
	}

	async verifyEmail({ token }) {
		const decodedToken = AuthUtils.decodeData(token, config.app.secretKey);

		if (!decodedToken) {
			throw new ExceptionUtils({
				status: httpStatus.UNAUTHORIZED,
				code: 'INVALID_TOKEN',
				message: 'Invalid token'
			});
		}

		await User.update({
			isEmailVerified: true
		}, {
			where: {
				id: decodedToken.user.id
			}
		});

		return true;
	}

	async requestResetPassword({ email }) {
		const user = await this.userService.getExistentUser(email);

		if (!user) {
			throw new ExceptionUtils({
				status: httpStatus.NOT_FOUND,
				code: 'USER_NOT_FOUND',
				message: 'User not found'
			});
		}

		const transaction = await this.database.masterInstance.transaction();

		try {
			const token = await AuthUtils.generateRandomToken();

			await UserRecoverPassword.create({
				used: false,
				token: token,
				userId: user.id
			}, { transaction });

			const link = `${config.client.baseUrl}/reset-password/${token}`;

			const emailOptions = {
				to: user.email,
				from: config.email.from,
				subject: 'Redefina sua senha',
				text: `Para redefinir sua senha, clique no link: ${link}`,
				html: EmailTemplates.getPasswordResetEmailTemplate(link)
			};

			await this.emailService.send(emailOptions);

			await transaction.commit();

			return true;
		} catch (error) {
			await transaction.rollback();
			throw error;
		}
	}

	async validateResetPassword({ token, options = {} }) {
		const userRecoverPassword = await UserRecoverPassword.findOne({
			where: {
				token,
				used: false
			},
			raw: true
		});

		if (!userRecoverPassword) {
			throw new ExceptionUtils({
				status: httpStatus.NOT_FOUND,
				code: 'INVALID_TOKEN',
				message: 'Invalid token'
			});
		}

		if (!options.returnData) {
			return true;
		}

		return userRecoverPassword;
	}

	async resetPassword({ token, password }) {
		const userRecoverPassword = await this.validateResetPassword({ token, options: { returnData: true } });

		if (!userRecoverPassword) {
			throw new ExceptionUtils({
				status: httpStatus.NOT_FOUND,
				code: 'USER_NOT_FOUND',
				message: 'User not found'
			});
		}

		const hashedPassword = bcryptjs.hashSync(password, 10);

		const transaction = await this.database.masterInstance.transaction();

		try {
			await User.update({
				password: hashedPassword
			}, {
				where: {
					id: userRecoverPassword.userId
				},
				transaction
			});

			await UserRecoverPassword.update({
				used: true
			}, {
				where: {
					id: userRecoverPassword.id
				},
				transaction
			});

			await transaction.commit();

			return true;
		} catch (error) {
			await transaction.rollback();
			throw error;
		}
	}
}

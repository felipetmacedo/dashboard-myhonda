import bcryptjs from 'bcryptjs';
import { pick } from 'lodash';
import httpStatus from 'http-status';
import Database from '@database';
import { UserService, EmailService } from '@services';
import { AuthUtils, ExceptionUtils, LoggerUtils, EmailTemplates } from '@utils';
import { User, UserRecoverPassword } from '@models';
import config from '../config/config';
import { Op } from 'sequelize';
export default class AuthService {
	constructor() {
		this.database = new Database();
		this.userService = new UserService();
		this.emailService = new EmailService();
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

		return AuthUtils.getTokenData(pick(user, ['id', 'name', 'email', 'isAdmin', 'storeId']));
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
		const { token } = await AuthUtils.getTokenData(pick(user, ['id', 'name', 'email', 'isAdmin', 'storeId']));

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

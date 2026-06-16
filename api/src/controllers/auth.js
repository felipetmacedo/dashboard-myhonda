import BaseController from './base';
import { AuthService } from '@services';

class AuthController extends BaseController {
	constructor() {
		super();

		this.authService = new AuthService();
		this.login = this.login.bind(this);
		this.register = this.register.bind(this);
		this.verifyEmail = this.verifyEmail.bind(this);
		this.requestResetPassword = this.requestResetPassword.bind(this);
		this.validateResetPassword = this.validateResetPassword.bind(this);
		this.resetPassword = this.resetPassword.bind(this);
		this.session = this.session.bind(this);
		this.changePassword = this.changePassword.bind(this);
		this.resetUserPassword = this.resetUserPassword.bind(this);
	}

	async login(req, res) {
		try {
			const response = await this.authService.login(req.data);

			this.sendSuccess({ data: response, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}

	async register(req, res) {
		try {
			const response = await this.authService.register(req.data);

			this.sendSuccess({ data: response, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}

	async verifyEmail(req, res) {
		try {
			const response = await this.authService.verifyEmail(req.filter);

			this.sendSuccess({ data: response, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}

	async requestResetPassword(req, res) {
		try {
			const response = await this.authService.requestResetPassword(req.data);

			this.sendSuccess({ data: response, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}

	async validateResetPassword(req, res) {
		try {
			const response = await this.authService.validateResetPassword(req.filter);

			this.sendSuccess({ data: response, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}

	async resetPassword(req, res) {
		try {
			const response = await this.authService.resetPassword(req.data);

			this.sendSuccess({ data: response, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}

	async session(req, res) {
		try {
			const response = await this.authService.getSession(req.auth.id);

			this.sendSuccess({ data: response, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}

	async changePassword(req, res) {
		try {
			await this.authService.changePassword(req.data, req.auth.id);
			this.sendSuccess({ data: { message: 'Senha alterada com sucesso' }, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}

	async resetUserPassword(req, res) {
		try {
			if (!req.auth.isAdmin) {
				return res.status(403).json({ status: 'error', message: 'Acesso negado' });
			}
			await this.authService.resetUserPassword(req.data);
			this.sendSuccess({ data: { message: 'Senha redefinida com sucesso' }, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}
}

export default AuthController;

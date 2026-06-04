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
}

export default AuthController;

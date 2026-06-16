import BaseRoutes from './base';
import { AuthSchema } from '@schemas';
import { AuthController } from '@controllers';
import { AuthMiddleware } from '@middlewares';

class AuthRoutes extends BaseRoutes {
	constructor() {
		super();

		this.authController = new AuthController();
	}

	setup() {
		this.router.post('/login', this.SchemaValidator.validate(AuthSchema.login), this.authController.login);
		this.router.post('/register', this.SchemaValidator.validate(AuthSchema.register), this.authController.register);
		this.router.get('/verify-email', this.SchemaValidator.validate(AuthSchema.verifyEmail), this.authController.verifyEmail);
		this.router.post('/request-reset-password', this.SchemaValidator.validate(AuthSchema.requestResetPassword), this.authController.requestResetPassword);
		this.router.get('/validate-reset-password', this.SchemaValidator.validate(AuthSchema.validateResetPassword), this.authController.validateResetPassword);
		this.router.post('/reset-password', this.SchemaValidator.validate(AuthSchema.resetPassword), this.authController.resetPassword);
		this.router.get('/session', AuthMiddleware.isAuthorized, this.authController.session);
		this.router.put('/change-password', AuthMiddleware.isAuthorized, this.SchemaValidator.validate(AuthSchema.changePassword), this.authController.changePassword);

		return this.router;
	}
}

export default AuthRoutes;

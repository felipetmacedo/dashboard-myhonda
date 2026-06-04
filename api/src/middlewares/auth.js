import { AuthUtils } from '@utils';
import config from '../config/config';
export default class AuthMiddleware {
	static isAuthorized(req, res, next) {
		const errorResponse = {
			status: 'error',
			code: 403,
			message: 'Expired session. Please login again.',
		};

		const token = AuthUtils.getBearerToken(req);
		const decodedToken = AuthUtils.decodeData(token, config.app.secretKey);

		if (!decodedToken || !decodedToken.user || !decodedToken.user.id) {
			res.status(403).json(errorResponse);

			return;
		}

		req.auth = {
			id: decodedToken.user.id,
			isAdmin: decodedToken.user.isAdmin,
			storeId: decodedToken.user.storeId,
		};

		next();
	}
}

AuthMiddleware.isAuthorized.__openapi = {
	type: 'auth',
	security: 'bearerAuth'
};

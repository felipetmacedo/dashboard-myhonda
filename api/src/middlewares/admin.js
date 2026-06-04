export default class AdminUserMiddleware {
	static isAuthorized(req, res, next) {
		const errorResponse = {
			status: 'error',
			code: 403,
			message: 'Você não tem permissão para acessar este recurso.',
		};

		if (!req.auth?.id || !req.auth.isAdmin) {
			res.status(403).json(errorResponse);

			return;
		}

		next();
	}
}

AdminUserMiddleware.isAuthorized.__openapi = {
	type: 'admin',
	security: 'bearerAuth',
	admin: true
};

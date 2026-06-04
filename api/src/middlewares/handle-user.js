export default class HandleUserMiddleware {
	static isAuthorized(req, res, next) {
		const errorResponse = {
			status: 'error',
			code: 403,
			message: 'You are not authorized to perform this action',
		};

		if (req.auth.isAdmin || req.auth.id === ~~req.params.id) {
			next();
			return;
		}

		res.status(403).json(errorResponse);
	}
}

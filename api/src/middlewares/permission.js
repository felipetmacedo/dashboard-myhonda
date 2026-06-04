import { UserService } from '@services';

export default class PermissionMiddleware {
	static hasPermission(permissionString) {
		const middleware = async (req, res, next) => {
			try {
				// Check if user is authenticated
				if (!req.auth || !req.auth.id) {
					return res.status(403).json({
						status: 'error',
						code: 403,
						message: 'Unauthorized access.',
					});
				}

				if (req.auth.isAdmin) {
					return next();
				}

				if (!req.auth.storeId) {
					return res.status(403).json({
						status: 'error',
						code: 403,
						message: 'Store context is required for this action.',
					});
				}

				// Split permission string into module and action
				const [module, action] = permissionString.split('.');

				// Validate that we have both module and action
				if (!module || !action) {
					return res.status(500).json({
						status: 'error',
						code: 500,
						message:
							'Invalid permission format. Use MODULE.ACTION format (e.g., USERS.CREATE).',
					});
				}

				// Check if user has required permission
				const userService = new UserService();
				const { permissions } = await userService.getPermissions(
					req.auth.id,
					req.auth.storeId
				);

				const hasPermission = permissions.some(
					perm => perm.module === module && perm.name === action
				);

				if (hasPermission) {
					req.auth = {
						id: req.auth.id,
						isAdmin: req.auth.isAdmin,
						storeId: req.auth.storeId,
					};

					return next();
				}

				return res.status(403).json({
					status: 'error',
					code: 403,
					message: `You don't have ${action} permission for ${module}.`,
				});
			} catch (error) {
				return res.status(500).json({
					status: 'error',
					code: 500,
					message:
						'Internal server error while checking permissions.',
				});
			}
		};

		middleware.__openapi = {
			type: 'permission',
			security: 'bearerAuth',
			permission: permissionString
		};

		return middleware;
	}
}

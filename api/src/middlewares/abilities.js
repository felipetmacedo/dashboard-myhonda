import { ForbiddenError } from '@casl/ability';

import { UserAbilities } from '@abilities';
import { UserService } from '@services';

export default class AbilityMiddleware {
	static getErrorMessageByPermission(permission, module) {
		const permissionMessages = {
			EXAMPLE: {
				READ: 'You are not authorized to view examples.',
				CREATE: 'You are not authorized to create examples.',
				UPDATE: 'You are not authorized to edit examples.',
				DELETE: 'You are not authorized to delete examples.'
			}
		};

		return permissionMessages[module]?.[permission] || 'Not authorized.';
	}

	static handleAuthorizationError(res, message) {
		return res.status(403).json({ message });
	}

	static validate(permission, module) {
		return async (req, res, next) => {
			try {
				if (!req.auth.id) {
					return AbilityMiddleware.handleAuthorizationError(res);
				}

				const user = await new UserService().info(req.auth);

				if (!user) {
					return AbilityMiddleware.handleAuthorizationError(res);
				}

				const ability = UserAbilities.forUser(user);

				ForbiddenError.from(ability).throwUnlessCan(permission, module);

				return next();
			} catch (error) {
				return AbilityMiddleware.handleAuthorizationError(res, AbilityMiddleware.getErrorMessageByPermission(permission, module));
			}
		};
	}
}

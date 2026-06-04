import BaseRoutes from './base';
import { PermissionController } from '@controllers';
import { PermissionSchema } from '@schemas';
import { PermissionMiddleware } from '@middlewares';

class PermissionRoutes extends BaseRoutes {
	constructor() {
		super();
		this.permissionController = new PermissionController();
	}

	setup() {
		this.router.post(
			'/',
			PermissionMiddleware.hasPermission('PERMISSIONS.CREATE'),
			this.SchemaValidator.validate(PermissionSchema.create),
			this.permissionController.create
		);

		this.router.get(
			'/',
			PermissionMiddleware.hasPermission('PERMISSIONS.READ'),
			this.SchemaValidator.validate(PermissionSchema.list),
			this.permissionController.list
		);

		this.router.get(
			'/:id',
			PermissionMiddleware.hasPermission('PERMISSIONS.READ'),
			this.SchemaValidator.validate(PermissionSchema.find),
			this.permissionController.find
		);

		this.router.put(
			'/:id',
			PermissionMiddleware.hasPermission('PERMISSIONS.UPDATE'),
			this.SchemaValidator.validate(PermissionSchema.update),
			this.permissionController.update
		);

		this.router.delete(
			'/:id',
			PermissionMiddleware.hasPermission('PERMISSIONS.DELETE'),
			this.SchemaValidator.validate(PermissionSchema.delete),
			this.permissionController.delete
		);

		return this.router;
	}
}

export default PermissionRoutes;

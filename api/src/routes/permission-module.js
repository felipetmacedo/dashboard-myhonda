import BaseRoutes from './base';
import { PermissionModuleController } from '@controllers';
import { PermissionModuleSchema } from '@schemas';
import { PermissionMiddleware } from '@middlewares';

class PermissionModuleRoutes extends BaseRoutes {
	constructor() {
		super();
		this.permissionModuleController = new PermissionModuleController();
	}

	setup() {
		this.router.post(
			'/',
			PermissionMiddleware.hasPermission('PERMISSIONS.CREATE'),
			this.SchemaValidator.validate(PermissionModuleSchema.create),
			this.permissionModuleController.create
		);

		this.router.get(
			'/',
			PermissionMiddleware.hasPermission('PERMISSIONS.READ'),
			this.SchemaValidator.validate(PermissionModuleSchema.list),
			this.permissionModuleController.list
		);

		this.router.get(
			'/:id',
			PermissionMiddleware.hasPermission('PERMISSIONS.READ'),
			this.SchemaValidator.validate(PermissionModuleSchema.find),
			this.permissionModuleController.find
		);

		this.router.put(
			'/:id',
			PermissionMiddleware.hasPermission('PERMISSIONS.UPDATE'),
			this.SchemaValidator.validate(PermissionModuleSchema.update),
			this.permissionModuleController.update
		);

		this.router.delete(
			'/:id',
			PermissionMiddleware.hasPermission('PERMISSIONS.DELETE'),
			this.SchemaValidator.validate(PermissionModuleSchema.delete),
			this.permissionModuleController.delete
		);

		return this.router;
	}
}

export default PermissionModuleRoutes;

import BaseRoutes from './base';
import { UserSchema } from '@schemas';
import { UserController } from '@controllers';
import { AdminUserMiddleware, PermissionMiddleware } from '@middlewares';

class UserRoutes extends BaseRoutes {
	constructor() {
		super();

		this.userController = new UserController();
	}

	setup() {
		// User Info Flows
		this.router.get('/info', this.userController.getInfo);
		this.router.get('/', PermissionMiddleware.hasPermission('USERS.READ'), this.SchemaValidator.validate(UserSchema.list), this.userController.list);
		this.router.get('/:id', PermissionMiddleware.hasPermission('USERS.READ'), this.SchemaValidator.validate(UserSchema.find), this.userController.find);
		this.router.post('/', PermissionMiddleware.hasPermission('USERS.CREATE'), this.SchemaValidator.validate(UserSchema.create), this.userController.create);
		this.router.put('/:id', PermissionMiddleware.hasPermission('USERS.UPDATE'), this.SchemaValidator.validate(UserSchema.update), this.userController.update);
		this.router.delete('/:id', PermissionMiddleware.hasPermission('USERS.DELETE'), this.SchemaValidator.validate(UserSchema.delete), this.userController.delete);

		this.router.put('/', this.SchemaValidator.validate(UserSchema.updateProfile), this.userController.updateProfile);

		// User Permission Flows
		this.router.post('/:id/permissions', AdminUserMiddleware.isAuthorized, this.SchemaValidator.validate(UserSchema.addPermissions), this.userController.addPermissions);
		this.router.put('/:id/permissions', AdminUserMiddleware.isAuthorized, this.SchemaValidator.validate(UserSchema.updatePermissions), this.userController.updatePermissions);
		this.router.get('/:id/permissions', AdminUserMiddleware.isAuthorized, this.SchemaValidator.validate(UserSchema.getPermissions), this.userController.getPermissions);
		this.router.delete('/:id/permissions/:permissionId', AdminUserMiddleware.isAuthorized, this.SchemaValidator.validate(UserSchema.removePermission), this.userController.removePermission);

		return this.router;
	}
}

export default UserRoutes;

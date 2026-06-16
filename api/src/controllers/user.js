import BaseController from './base';
import { UserService, UserPermissionService, AuthService } from '@services';

class UserController extends BaseController {
	constructor() {
		super();

		this.userService = new UserService();
		this.userPermissionService = new UserPermissionService();
		this.authService = new AuthService();

		this.list = this.list.bind(this);
		this.getInfo = this.getInfo.bind(this);
		this.find = this.find.bind(this);
		this.update = this.update.bind(this);
		this.delete = this.delete.bind(this);
		this.create = this.create.bind(this);
		this.updatePermissions = this.updatePermissions.bind(this);
		this.addPermissions = this.addPermissions.bind(this);
		this.removePermission = this.removePermission.bind(this);
		this.getPermissions = this.getPermissions.bind(this);
		this.updateProfile = this.updateProfile.bind(this);
		this.resetUserPassword = this.resetUserPassword.bind(this);
	}

	async addPermissions(req, res) {
		try {
			const options = {
				id: req.filter.id,
				data: req.data,
				meta: {
					loggedUserId: req.auth.id,
					storeId: req.auth.storeId,
				}
			};

			const response = await this.userPermissionService.add(options);

			this.sendSuccess({ data: response, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}

	async create(req, res) {
		try {
			const user = await this.userService.create({
				...req.data,
				store_id: req.auth.storeId,
				logged_user_id: req.auth.id
			});

			this.sendSuccess({ res, data: user });
		} catch (error) {
			this.sendError({ error, res });
		}
	}

	async updatePermissions(req, res) {
		try {
			const options = {
				id: req.filter.id,
				data: req.data,
				meta: {
					loggedUserId: req.auth.id,
					storeId: req.auth.storeId
				}
			};

			const response = await this.userPermissionService.update(options);

			this.sendSuccess({ data: response, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}

	async find(req, res) {
		try {
			const response = await this.userService.find({
				id: req.filter.id,
				storeId: req.auth.storeId
			});

			this.sendSuccess({ data: response, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}

	async list(req, res) {
		try {
			const response = await this.userService.list(req.auth.storeId, req.filter);

			this.sendSuccess({ data: response, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}

	async getInfo(req, res) {
		try {
			const response = await this.userService.info({
				id: req.auth.id,
				storeId: req.auth.storeId
			});

			this.sendSuccess({ data: response, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}

	async update(req, res) {
		try {
			const options = {
				id: req.filter.id,
				data: req.data,
				meta: {
					loggedUserId: req.auth.id,
					storeId: req.auth.storeId
				}
			};

			const response = await this.userService.update(options);

			this.sendSuccess({ data: response, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}

	async updateProfile(req, res) {
		try {
			const response = await this.userService.updateProfile({
				id: req.auth.id,
				data: req.data
			});

			this.sendSuccess({ data: response, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}

	async delete(req, res) {
		try {
			const options = {
				id: req.filter.id,
				meta: {
					loggedUserId: req.auth.id,
					storeId: req.auth.storeId
				}
			};

			const response = await this.userService.delete(options);

			this.sendSuccess({ data: response, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}

	async getPermissions(req, res) {
		try {
			const response = await this.userPermissionService.list({
				id: req.filter.id,
				meta: {
					loggedUserId: req.auth.id,
					storeId: req.auth.storeId
				}
			});

			this.sendSuccess({ data: response, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}

	async removePermission(req, res) {
		try {
			const response = await this.userPermissionService.remove({
				id: req.filter.id,
				permissionId: req.filter.permissionId,
				meta: {
					loggedUserId: req.auth.id,
					storeId: req.auth.storeId
				}
			});

			this.sendSuccess({ data: response, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}

	async resetUserPassword(req, res) {
		try {
			await this.authService.resetUserPassword({
				userId: req.filter.id,
				newPassword: req.data?.newPassword || req.body?.newPassword
			});
			this.sendSuccess({ data: { message: 'Senha redefinida com sucesso' }, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}
}

export default UserController;

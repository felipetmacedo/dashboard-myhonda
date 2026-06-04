import BaseController from './base';
import { PermissionService } from '@services';

export default class PermissionController extends BaseController {
	constructor() {
		super();
		this.permissionService = new PermissionService();

		this.create = this.create.bind(this);
		this.find = this.find.bind(this);
		this.list = this.list.bind(this);
		this.update = this.update.bind(this);
		this.delete = this.delete.bind(this);
	}

	async create(req, res) {
		try {
			const response = await this.permissionService.create(req.data);
			this.sendSuccess({ data: response, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}

	async find(req, res) {
		try {
			const response = await this.permissionService.find(req.filter);
			this.sendSuccess({ data: response, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}

	async list(req, res) {
		try {
			const response = await this.permissionService.list(req.filter);
			this.sendSuccess({ data: response, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}

	async update(req, res) {
		try {
			const response = await this.permissionService.update(req.filter, req.data);
			this.sendSuccess({ data: response, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}

	async delete(req, res) {
		try {
			const response = await this.permissionService.delete(req.filter);
			this.sendSuccess({ data: response, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}
}

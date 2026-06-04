import BaseController from './base';
import { PermissionModuleService } from '@services';

export default class PermissionModuleController extends BaseController {
	constructor() {
		super();
		this.permissionModuleService = new PermissionModuleService();

		this.create = this.create.bind(this);
		this.find = this.find.bind(this);
		this.list = this.list.bind(this);
		this.update = this.update.bind(this);
		this.delete = this.delete.bind(this);
	}

	async create(req, res) {
		try {
			const response = await this.permissionModuleService.create(req.data);
			this.sendSuccess({ data: response, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}

	async find(req, res) {
		try {
			const response = await this.permissionModuleService.find(req.filter);
			this.sendSuccess({ data: response, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}

	async list(req, res) {
		try {
			const response = await this.permissionModuleService.list(req.filter);
			this.sendSuccess({ data: response, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}

	async update(req, res) {
		try {
			const response = await this.permissionModuleService.update(req.filter, req.data);
			this.sendSuccess({ data: response, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}

	async delete(req, res) {
		try {
			const response = await this.permissionModuleService.delete(req.filter);
			this.sendSuccess({ data: response, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}
}

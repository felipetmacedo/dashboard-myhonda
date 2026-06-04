import { StoreService } from '@services';
import BaseController from './base';

export default class StoreController extends BaseController {
	constructor() {
		super();
		this.storeService = new StoreService();

		this.find = this.find.bind(this);
		this.update = this.update.bind(this);
		this.list = this.list.bind(this);
		this.create = this.create.bind(this);
		this.delete = this.delete.bind(this);
	}

	async create(req, res) {
		try {
			const store = await this.storeService.create({
				...req.data,
				logged_user_id: req.auth.id,
			});

			this.sendSuccess({ data: store, res });
		} catch (error) {
			this.sendError({ error, res });
		}
	}

	async find(req, res) {
		try {
			const store = await this.storeService.find({
				id: req.auth.storeId
			});

			this.sendSuccess({ data: store, res });
		} catch (error) {
			this.sendError({ error, res });
		}
	}

	async update(req, res) {
		try {
			const store = await this.storeService.update({
				id: req.filter.id
			}, {
				...req.data,
				updater_id: req.auth.id
			});

			this.sendSuccess({ data: store, res });
		} catch (error) {
			this.sendError({ error, res });
		}
	}

	async list(req, res) {
		try {
			const stores = await this.storeService.list(req.filter);

			this.sendSuccess({ data: stores, res });
		} catch (error) {
			this.sendError({ error, res });
		}
	}

	async delete(req, res) {
		try {
			const store = await this.storeService.delete(req.filter);

			this.sendSuccess({ data: store, res });
		} catch (error) {
			this.sendError({ error, res });
		}
	}
}

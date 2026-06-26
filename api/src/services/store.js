import { Store, StoreCompany, IhsCompany, Member } from '@models';
import { ExceptionUtils, LoggerUtils, PaginationUtils } from '@utils';
import Database from '@database';
import httpStatus from 'http-status';

export default class StoreService {
	constructor() {
		this.database = new Database();
	}

	async create(data) {
		const transaction = await this.database.masterInstance.transaction();

		try {
			const store = await Store.create({ name: data.name }, { transaction });

			if (data.codhdas?.length) {
				await StoreCompany.bulkCreate(
					data.codhdas.map(codhda => ({ storeId: store.id, codhda })),
					{ transaction }
				);
			}

			await transaction.commit();

			return this.find({ id: store.id });
		} catch (error) {
			LoggerUtils.error('Error creating store', error);
			await transaction.rollback();
			throw error;
		}
	}

	async find(filter) {
		const store = await Store.findOne({
			where: { id: filter.id, is_deleted: false },
			include: [{
				model: StoreCompany,
				as: 'companies',
				include: [{ model: IhsCompany, as: 'company' }]
			}]
		});

		if (!store) {
			throw new ExceptionUtils({
				status: httpStatus.NOT_FOUND,
				code: 'NOT_FOUND',
				message: 'Store not found'
			});
		}

		return store.toJSON();
	}

	async list(filter) {
		const pagination = PaginationUtils.config({
			page: filter.page || 1,
			items_per_page: filter.items_per_page || filter.itemsPerPage || 200
		});

		const total = await Store.count({ where: { is_deleted: false } });

		let stores;
		try {
			stores = await Store.findAll({
				...pagination.getQueryParams(),
				where: { is_deleted: false },
				include: [{
					model: StoreCompany,
					as: 'companies',
					required: false,
					include: [{
						model: IhsCompany,
						as: 'company',
						required: false,
					}]
				}]
			});
		} catch (err) {
			LoggerUtils.error('Store list with IhsCompany failed, retrying without:', err.message);
			try {
				stores = await Store.findAll({
					...pagination.getQueryParams(),
					where: { is_deleted: false },
					include: [{
						model: StoreCompany,
						as: 'companies',
						required: false,
					}]
				});
			} catch (err2) {
				LoggerUtils.error('Store list with StoreCompany failed, retrying plain:', err2.message);
				stores = await Store.findAll({
					...pagination.getQueryParams(),
					where: { is_deleted: false },
				});
			}
		}

		return {
			...pagination.mount(total),
			items: stores.map(s => s.toJSON())
		};
	}

	async update(filter, data) {
		const transaction = await this.database.masterInstance.transaction();

		try {
			const store = await Store.findOne({ where: { id: filter.id, is_deleted: false } });

			if (!store) {
				throw new ExceptionUtils({
					status: httpStatus.NOT_FOUND,
					code: 'NOT_FOUND',
					message: 'Loja não encontrada'
				});
			}

			if (data.name) {
				await Store.update({ name: data.name }, { where: { id: store.id }, transaction });
			}

			if (data.codhdas && Array.isArray(data.codhdas)) {
				await StoreCompany.destroy({ where: { storeId: store.id }, transaction });
				await StoreCompany.bulkCreate(
					data.codhdas.map(codhda => ({ storeId: store.id, codhda })),
					{ transaction }
				);
			}

			await transaction.commit();

			return this.find({ id: store.id });
		} catch (error) {
			LoggerUtils.error('Error updating store', error);
			await transaction.rollback();
			throw error;
		}
	}

	async delete(filter) {
		const transaction = await this.database.masterInstance.transaction();

		try {
			const store = await Store.findOne({ where: { id: filter.id, is_deleted: false } });

			if (!store) {
				throw new ExceptionUtils({
					status: httpStatus.NOT_FOUND,
					code: 'NOT_FOUND',
					message: 'Loja não encontrada'
				});
			}

			await Member.update(
				{ isDeleted: true },
				{ where: { storeId: filter.id }, transaction }
			);

			await store.update({ is_deleted: true }, { transaction });
			await transaction.commit();

			return { message: 'Loja removida com sucesso' };
		} catch (error) {
			LoggerUtils.error('Error deleting store', error);
			await transaction.rollback();
			throw error;
		}
	}

	async listCompanies() {
		return IhsCompany.findAll({
			attributes: ['ihscompany_id', 'codhda', 'empresa', 'sigla_loja', 'cnpj', 'ihscompany_name'],
			order: [['empresa', 'ASC']],
			raw: true,
		});
	}
}

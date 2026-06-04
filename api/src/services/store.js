import { Store, Member, Address } from '@models';
import { ExceptionUtils, EmailTemplates, Utils, LoggerUtils, PaginationUtils } from '@utils';
import httpStatus from 'http-status';
import Database from '@database';
import UserService from './user';
import { EmailService } from '@services';

export default class StoreService {
	constructor() {
		this.database = new Database();
		this.userService = new UserService();
		this.emailService = new EmailService();
	}

	async create(data) {
		const transaction = await this.database.masterInstance.transaction();

		try {
			const existingStore = await Store.findOne({
				where: {
					cnpj: data.cnpj,
					is_deleted: false
				}
			});

			if (existingStore) {
				throw new ExceptionUtils({
					status: httpStatus.BAD_REQUEST,
					code: 'BAD_REQUEST',
					message: 'CNPJ já cadastrado'
				});
			}

			const address = await Address.create({
				cep: data.cep,
				address: data.address,
				number: data.number,
				complement: data.complement,
				neighborhood: data.neighborhood,
				city: data.city,
				state: data.state
			}, { transaction });

			const store = await Store.create({
				name: data.name,
				razao_social: data.razao_social,
				nome_fantasia: data.nome_fantasia,
				inscricao_estadual: data.inscricao_estadual,
				inscricao_municipal: data.inscricao_municipal,
				email: data.email,
				cnpj: data.cnpj,
				address_id: address.id,
			}, { transaction });

			const password = Utils.generateRandomPassword();

			const userData = {
				name: data.name,
				email: data.email,
				password,
				document: data.cnpj,
				store_id: store.id,
				address_id: address.id,
				logged_user_id: data.logged_user_id,
			};

			const user = await this.userService.createTeamUser(userData, { transaction });

			const emailOptions = {
				to: data.email,
				subject: 'Bem-vindo ao SIG - Suas Credenciais de Acesso',
				text: 'Bem-vindo ao SIG - Suas Credenciais de Acesso',
				html: EmailTemplates.getWelcomeEmailTemplate(user.name, data.email, password)
			};

			await this.emailService.send(emailOptions);

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
			where: {
				id: filter.id,
				is_deleted: false
			},
			include: [{
				model: Address,
				as: 'address',
				attributes: ['id', 'cep', 'address', 'number', 'complement', 'neighborhood', 'city', 'state']
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
			items_per_page: filter.itemsPerPage || 10
		});

		const [stores, total] = await Promise.all([
			Store.findAll({
				...pagination.getQueryParams(),
				where: {
					is_deleted: false
				},
				attributes: ['id', 'name', 'cnpj', 'email', 'created_at', 'updated_at'],
				include: {
					model: Address,
					as: 'address',
					attributes: ['id', 'complement', 'neighborhood', 'city', 'state', 'cep', 'address', 'number']
				}
			}),
			Store.count({
				where: {
					is_deleted: false
				}
			})
		]);

		return {
			...pagination.mount(total),
			items: stores.map(store => store.toJSON())
		};
	}

	async update(filter, data) {
		const transaction = await this.database.masterInstance.transaction();

		try {
			const store = await Store.findOne({
				where: {
					id: filter.id,
					is_deleted: false
				}
			});

			if (!store) {
				throw new ExceptionUtils({
					status: httpStatus.NOT_FOUND,
					code: 'NOT_FOUND',
					message: 'Líder não encontrado'
				});
			}

			await Address.update({
				cep: data.cep,
				address: data.address,
				number: data.number,
				complement: data.complement,
				neighborhood: data.neighborhood,
				city: data.city,
				state: data.state
			}, {
				where: {
					id: store.address_id
				},
				transaction
			});

			await Store.update({
				name: data.name,
				razao_social: data.razao_social,
				nome_fantasia: data.nome_fantasia,
				inscricao_estadual: data.inscricao_estadual,
				inscricao_municipal: data.inscricao_municipal,
				email: data.email,
				cnpj: data.cnpj
			}, {
				where: { id: store.id },
				transaction
			});

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
			const store = await Store.findOne({
				where: {
					id: filter.id,
					is_deleted: false
				}
			});

			if (!store) {
				throw new ExceptionUtils({
					status: httpStatus.NOT_FOUND,
					code: 'NOT_FOUND',
					message: 'Líder não encontrado'
				});
			}

			await Member.update(
				{ isDeleted: true },
				{
					where: { storeId: filter.id },
					transaction
				}
			);

			await store.update(
				{ is_deleted: true },
				{ transaction }
			);

			await transaction.commit();

			return {
				message: 'Líder deletado com sucesso'
			};
		} catch (error) {
			LoggerUtils.error('Error deleting store', error);
			await transaction.rollback();
			throw error;
		}
	}
}

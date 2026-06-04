import BaseController from './base';
import { ReportsService } from '@services';

export default class ReportsController extends BaseController {
	constructor() {
		super();

		this.reportsService = new ReportsService();

		this.leads = this.leads.bind(this);
	}

	async leads(req, res) {
		try {
			const { dataInicio, dataFinal, codhda } = req.filter;
			const data = await this.reportsService.leads({ dataInicio, dataFinal, codhda });
			this.sendSuccess({ data, res });
		} catch (error) {
			this.sendError({ error, res });
		}
	}
}

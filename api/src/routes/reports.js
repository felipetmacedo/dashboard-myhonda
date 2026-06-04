import BaseRoutes from './base';
import { ReportsSchema } from '@schemas';
import { ReportsController } from '@controllers';

class ReportsRoutes extends BaseRoutes {
	constructor() {
		super();
		this.reportsController = new ReportsController();
	}

	setup() {
		this.router.get('/leads', this.SchemaValidator.validate(ReportsSchema.leads), this.reportsController.leads);
		return this.router;
	}
}

export default ReportsRoutes;

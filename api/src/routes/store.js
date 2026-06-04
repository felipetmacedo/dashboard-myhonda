import BaseRoutes from './base';
import { StoreSchema } from '@schemas';
import { StoreController } from '@controllers';
import { PermissionMiddleware } from '@middlewares';

class StoreRoutes extends BaseRoutes {
	constructor() {
		super();
		this.storeController = new StoreController();
	}

	setup() {
		this.router.post('/',
			PermissionMiddleware.hasPermission('STORES.CREATE'),
			this.SchemaValidator.validate(StoreSchema.create),
			this.storeController.create
		);

		this.router.get('/',
			PermissionMiddleware.hasPermission('STORES.READ'),
			this.storeController.find
		);

		this.router.get('/all',
			PermissionMiddleware.hasPermission('STORES.READ'),
			this.SchemaValidator.validate(StoreSchema.list),
			this.storeController.list
		);

		this.router.put('/:id',
			PermissionMiddleware.hasPermission('STORES.UPDATE'),
			this.SchemaValidator.validate(StoreSchema.update),
			this.storeController.update
		);

		this.router.delete('/:id',
			PermissionMiddleware.hasPermission('STORES.DELETE'),
			this.SchemaValidator.validate(StoreSchema.delete),
			this.storeController.delete
		);

		return this.router;
	}
}

export default StoreRoutes;
